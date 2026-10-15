import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'node:crypto';

/**
 * Cifra de segredos guardados no banco (ex.: a chave de API do provedor de
 * IA). AES-256-GCM com chave derivada do `AUTH_SECRET` por HKDF-SHA256, com
 * um contexto próprio por finalidade: a mesma variável de ambiente que já é
 * obrigatória e gerada por `pnpm env:init`, sem um segredo novo para
 * administrar. Formato gravado: `v1.<iv>.<tag>.<texto cifrado>` em base64url.
 *
 * Trocar o `AUTH_SECRET` torna os segredos antigos ilegíveis: `decifrar`
 * devolve `null` e o administrador informa a chave de novo.
 */

const VERSAO = 'v1';

function chaveDerivada(finalidade: string) {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo) {
    throw new Error('Variável de ambiente obrigatória ausente: AUTH_SECRET');
  }
  return Buffer.from(
    hkdfSync(
      'sha256',
      Buffer.from(segredo, 'utf8'),
      Buffer.from('lyra-metacare', 'utf8'),
      Buffer.from(`lyra:${finalidade}`, 'utf8'),
      32
    )
  );
}

export function cifrar(texto: string, finalidade: string): string {
  const iv = randomBytes(12);
  const cifra = createCipheriv('aes-256-gcm', chaveDerivada(finalidade), iv);
  const conteudo = Buffer.concat([cifra.update(texto, 'utf8'), cifra.final()]);
  return [
    VERSAO,
    iv.toString('base64url'),
    cifra.getAuthTag().toString('base64url'),
    conteudo.toString('base64url'),
  ].join('.');
}

/** Texto original, ou `null` se o valor foi alterado ou o segredo mudou. */
export function decifrar(valor: string, finalidade: string): string | null {
  const partes = valor.split('.');
  if (partes.length !== 4 || partes[0] !== VERSAO) return null;
  try {
    const decifra = createDecipheriv(
      'aes-256-gcm',
      chaveDerivada(finalidade),
      Buffer.from(partes[1], 'base64url')
    );
    decifra.setAuthTag(Buffer.from(partes[2], 'base64url'));
    return Buffer.concat([
      decifra.update(Buffer.from(partes[3], 'base64url')),
      decifra.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}
