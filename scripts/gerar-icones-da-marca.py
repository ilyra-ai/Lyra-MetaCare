#!/usr/bin/env python3
"""Gera a marca e os ícones da Lyra a partir do logo oficial (tarefa 47).

Entrada: ``docs/marca/lyra-logo-oficial.png`` (logo sobre fundo branco).
Saídas (todas versionadas):

- ``src/assets/marca/lyra-logo.png``: logo 512 px com o fundo branco
  convertido em transparência, usado pelo componente ``MarcaLyra``;
- ``src/app/favicon.ico`` (16, 32, 48 e 64 px) e ``src/app/icon.png``
  (192 px): logo num ladrilho branco arredondado, legível em abas claras e
  escuras;
- ``src/app/apple-icon.png`` (180 px, fundo branco, sem transparência);
- ``public/icones/lyra-192.png``, ``lyra-512.png`` e
  ``lyra-maskable-512.png`` (manifesto; o maskable mantém a marca dentro da
  área segura de 80%).

Uso (na raiz do repositório)::

    python3 -m venv /tmp/marca && /tmp/marca/bin/pip install pillow numpy
    /tmp/marca/bin/python scripts/gerar-icones-da-marca.py

Só é preciso rodar de novo se o logo oficial mudar.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "docs/marca/lyra-logo-oficial.png"

# O fundo do arquivo oficial não é branco puro (253 a 255, com ruído de
# compressão): distâncias do branco até este limiar viram transparência total.
LIMIAR_DO_FUNDO = 6.0
# Respiro em volta da área útil do logo no recorte quadrado.
RESPIRO = 1.06


def logo_transparente(caminho: Path) -> Image.Image:
    """Converte o branco do fundo em alfa ("cor para alfa", como no GIMP)."""
    rgb = np.asarray(Image.open(caminho).convert("RGB")).astype(np.float64)
    distancia = 255.0 - rgb
    alfa = np.clip(
        (distancia.max(axis=2) - LIMIAR_DO_FUNDO) / (255.0 - LIMIAR_DO_FUNDO),
        0.0,
        1.0,
    )
    divisor = np.where(alfa > 0, alfa, 1.0)[..., None]
    # Cor "desmisturada" do branco: c = 255 - (255 - c_original) / alfa.
    cor = np.clip(255.0 - distancia / divisor, 0, 255)
    rgba = np.dstack([cor, alfa * 255.0]).round().astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def recorte_quadrado(logo: Image.Image) -> Image.Image:
    """Recorta um quadrado centrado na área útil do logo."""
    mascara = logo.getchannel("A").point(lambda a: 255 if a > 8 else 0)
    caixa = mascara.getbbox()
    if caixa is None:
        raise SystemExit(f"Nenhum conteúdo visível em {ORIGEM}")
    x0, y0, x1, y1 = caixa
    lado = int(max(x1 - x0, y1 - y0) * RESPIRO)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return logo.crop(
        (
            round(cx - lado / 2),
            round(cy - lado / 2),
            round(cx + lado / 2),
            round(cy + lado / 2),
        )
    )


def reduzir(imagem: Image.Image, lado: int) -> Image.Image:
    return imagem.resize((lado, lado), Image.Resampling.LANCZOS)


def sobre_fundo_branco(marca: Image.Image, lado: int, escala: float) -> Image.Image:
    base = Image.new("RGBA", (lado, lado), (255, 255, 255, 255))
    interno = round(lado * escala)
    base.alpha_composite(reduzir(marca, interno), ((lado - interno) // 2,) * 2)
    return base.convert("RGB")


def ladrilho(marca: Image.Image, lado: int, escala: float = 0.9) -> Image.Image:
    """Logo num quadrado branco de cantos arredondados, fora dele transparente."""
    base = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    # Máscara desenhada em 4x e reduzida, para cantos suaves.
    grande = Image.new("L", (lado * 4, lado * 4), 0)
    ImageDraw.Draw(grande).rounded_rectangle(
        (0, 0, lado * 4 - 1, lado * 4 - 1), radius=round(lado * 4 * 0.22), fill=255
    )
    base.paste(
        (255, 255, 255, 255),
        (0, 0),
        grande.resize((lado, lado), Image.Resampling.LANCZOS),
    )
    interno = round(lado * escala)
    base.alpha_composite(reduzir(marca, interno), ((lado - interno) // 2,) * 2)
    return base


def main() -> None:
    marca = recorte_quadrado(logo_transparente(ORIGEM))

    assets = RAIZ / "src/assets/marca"
    app = RAIZ / "src/app"
    icones = RAIZ / "public/icones"
    assets.mkdir(parents=True, exist_ok=True)
    icones.mkdir(parents=True, exist_ok=True)

    saidas = {
        assets / "lyra-logo.png": reduzir(marca, 512),
        app / "icon.png": ladrilho(marca, 192),
        app / "apple-icon.png": sobre_fundo_branco(marca, 180, 0.84),
        icones / "lyra-192.png": sobre_fundo_branco(marca, 192, 0.86),
        icones / "lyra-512.png": sobre_fundo_branco(marca, 512, 0.86),
        icones / "lyra-maskable-512.png": sobre_fundo_branco(marca, 512, 0.66),
    }
    for caminho, imagem in saidas.items():
        imagem.save(caminho, optimize=True)
    favicon = app / "favicon.ico"
    ladrilho(marca, 256).save(favicon, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    for caminho in [*saidas, favicon]:
        print(f"{caminho.relative_to(RAIZ)}  {caminho.stat().st_size} bytes")


if __name__ == "__main__":
    main()
