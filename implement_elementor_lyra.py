from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MODULE_ID = "elementor-lyra"
SUPPORTED_PROJECT = "nextjs-app-router-typescript"


@dataclass
class InstallAction:
    kind: str
    path: str
    details: str


@dataclass
class InstallReport:
    moduleId: str
    moduleVersion: str
    supportedProject: str
    installedAt: str
    targetRoot: str
    sourceRoot: str
    actions: list[InstallAction]
    warnings: list[str]


class InstallError(RuntimeError):
    pass


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise InstallError(f"Arquivo JSON obrigatório não encontrado: {path}") from exc
    except json.JSONDecodeError as exc:
        raise InstallError(f"Arquivo JSON inválido: {path}") from exc


def write_text_file(path: Path, content: str, actions: list[InstallAction]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        path.write_text(content, encoding="utf-8")
        actions.append(InstallAction("create", str(path), "Arquivo criado."))
        return

    current = path.read_text(encoding="utf-8")
    if current == content:
        actions.append(
            InstallAction("skip", str(path), "Arquivo já estava alinhado ao módulo.")
        )
        return

    backup_path = path.with_suffix(f"{path.suffix}.bak.{datetime.now().strftime('%Y%m%d%H%M%S')}")
    shutil.copy2(path, backup_path)
    path.write_text(content, encoding="utf-8")
    actions.append(
        InstallAction(
            "update",
            str(path),
            f"Arquivo atualizado com backup real em {backup_path.name}.",
        )
    )


def ensure_directory(path: Path, actions: list[InstallAction]) -> None:
    if path.exists():
        actions.append(InstallAction("skip", str(path), "Diretório já existente."))
        return
    path.mkdir(parents=True, exist_ok=True)
    actions.append(InstallAction("create", str(path), "Diretório criado."))


def relative_ts_import(from_file: Path, to_file: Path) -> str:
    relative_path = Path(os.path.relpath(to_file.with_suffix(""), from_file.parent)).as_posix()
    if not relative_path.startswith("."):
        relative_path = f"./{relative_path}"
    return relative_path


def detect_source_root(project_root: Path) -> Path:
    src_root = project_root / "src"
    if src_root.is_dir():
        return src_root
    return project_root


def validate_supported_project(project_root: Path, package_json: dict[str, Any]) -> None:
    dependencies = package_json.get("dependencies", {})
    dev_dependencies = package_json.get("devDependencies", {})
    installed_names = set(dependencies) | set(dev_dependencies)

    required = {"next", "react", "typescript"}
    missing = sorted(required - installed_names)
    if missing:
        raise InstallError(
            "Projeto incompatível com o instalador do Elementor Lyra. "
            f"Dependências ausentes: {', '.join(missing)}."
        )

    if not (project_root / "tsconfig.json").exists():
        raise InstallError(
            "Projeto incompatível: tsconfig.json não encontrado na raiz."
        )

    source_root = detect_source_root(project_root)
    app_dir = source_root / "app"
    if not app_dir.is_dir():
        raise InstallError(
            "Projeto incompatível: o instalador atual exige Next.js App Router "
            f"com diretório de app em {app_dir}."
        )


def sync_module_directory(
    module_source: Path,
    target_root: Path,
    actions: list[InstallAction],
) -> Path:
    target_module_dir = target_root / "modules" / MODULE_ID

    if module_source.resolve() == target_module_dir.resolve():
        actions.append(
            InstallAction(
                "validate",
                str(target_module_dir),
                "Módulo já presente no projeto-alvo.",
            )
        )
        return target_module_dir

    existed_before = target_module_dir.exists()
    target_module_dir.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(module_source, target_module_dir, dirs_exist_ok=True)
    actions.append(
        InstallAction(
            "update" if existed_before else "create",
            str(target_module_dir),
            "Arquivos do módulo sincronizados no projeto-alvo.",
        )
    )
    return target_module_dir


def ensure_package_script(
    project_root: Path,
    package_json: dict[str, Any],
    actions: list[InstallAction],
) -> None:
    scripts = package_json.setdefault("scripts", {})
    expected = "python implement_elementor_lyra.py"

    if scripts.get("elementor:install") == expected:
        actions.append(
            InstallAction(
                "skip",
                str(project_root / "package.json"),
                "Script elementor:install já estava configurado.",
            )
        )
        return

    scripts["elementor:install"] = expected
    package_json_path = project_root / "package.json"
    package_json_path.write_text(
        json.dumps(package_json, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    actions.append(
        InstallAction(
            "update",
            str(package_json_path),
            "Script elementor:install registrado no package.json.",
        )
    )


def install_reexports(
    project_root: Path,
    source_root: Path,
    target_module_dir: Path,
    actions: list[InstallAction],
) -> None:
    site_page_config_dir = source_root / "lib" / "site-page-config"
    ensure_directory(site_page_config_dir, actions)

    schema_target = site_page_config_dir / "schema.ts"
    ui_target = site_page_config_dir / "ui.ts"
    index_target = site_page_config_dir / "index.ts"

    schema_source = target_module_dir / "src" / "site-page-config" / "schema"
    ui_source = target_module_dir / "src" / "site-page-config" / "ui"

    schema_import = relative_ts_import(schema_target, schema_source)
    ui_import = relative_ts_import(ui_target, ui_source)

    write_text_file(
        schema_target,
        f"export * from '{schema_import}';\n",
        actions,
    )
    write_text_file(
        ui_target,
        f"export * from '{ui_import}';\n",
        actions,
    )
    write_text_file(
        index_target,
        "export * from './schema';\nexport * from './ui';\n",
        actions,
    )


def build_report(
    manifest: dict[str, Any],
    project_root: Path,
    source_root: Path,
    actions: list[InstallAction],
) -> InstallReport:
    return InstallReport(
        moduleId=manifest["id"],
        moduleVersion=manifest["version"],
        supportedProject=SUPPORTED_PROJECT,
        installedAt=now_iso(),
        targetRoot=str(project_root),
        sourceRoot=str(source_root),
        actions=actions,
        warnings=[],
    )


def print_report(report: InstallReport) -> None:
    print("")
    print("Relatório da instalação do módulo Elementor Lyra")
    print(f"- Módulo: {report.moduleId} {report.moduleVersion}")
    print(f"- Projeto compatível: {report.supportedProject}")
    print(f"- Raiz alvo: {report.targetRoot}")
    print(f"- Source root detectado: {report.sourceRoot}")
    print(f"- Instalado em: {report.installedAt}")
    print("- Ações executadas:")
    for action in report.actions:
        print(f"  - [{action.kind}] {action.path} :: {action.details}")
    if report.warnings:
        print("- Avisos:")
        for warning in report.warnings:
            print(f"  - {warning}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Instala e configura o módulo reutilizável Elementor Lyra "
            "em projetos compatíveis com Next.js App Router + TypeScript."
        )
    )
    parser.add_argument(
        "--target",
        default=".",
        help="Diretório raiz do projeto-alvo. Padrão: diretório atual.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    script_root = Path(__file__).resolve().parent
    module_source = script_root / "modules" / MODULE_ID
    manifest_path = module_source / "module.manifest.json"

    if not module_source.is_dir():
        raise InstallError(
            f"Módulo {MODULE_ID} não encontrado em {module_source}. "
            "Copie a pasta do módulo para a raiz antes de executar."
        )

    manifest = load_json(manifest_path)

    project_root = Path(args.target).resolve()
    package_json_path = project_root / "package.json"
    if not package_json_path.exists():
        raise InstallError(
            f"package.json não encontrado em {project_root}. "
            "O projeto-alvo precisa ser uma aplicação compatível."
        )

    package_json = load_json(package_json_path)
    validate_supported_project(project_root, package_json)

    actions: list[InstallAction] = []
    target_module_dir = sync_module_directory(module_source, project_root, actions)
    source_root = detect_source_root(project_root)
    install_reexports(project_root, source_root, target_module_dir, actions)
    ensure_package_script(project_root, package_json, actions)

    report = build_report(manifest, project_root, source_root, actions)
    print_report(report)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except InstallError as exc:
        print(f"Erro de instalação do Elementor Lyra: {exc}", file=sys.stderr)
        raise SystemExit(1)
