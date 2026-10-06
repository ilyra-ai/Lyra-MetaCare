import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';

/**
 * Sanitizador do rich text do Puck (campo `richtext`), usado na renderização
 * do servidor e do navegador.
 *
 * O HTML é interpretado pelo parse5, que implementa o algoritmo de parsing do
 * padrão HTML (WHATWG), o mesmo dos navegadores; a saída é reconstruída do
 * zero a partir de uma lista de permissões:
 * - somente as tags de `TAGS_PERMITIDAS`, sempre sem atributos, exceto `href`
 *   em `<a>` (http, https, mailto, tel ou relativo);
 * - texto e atributos sempre escapados na serialização;
 * - conteúdo de `<script>`, `<style>`, `<template>` e similares é descartado;
 *   as demais tags não permitidas são removidas e o texto delas é mantido.
 *
 * Antes, o servidor usava expressões regulares e o navegador o DOMParser: um
 * `href` com aspas (`<a href='x" onmouseover="alert(1)'>`) passava pelo filtro
 * e virava atributo de evento no HTML do SSR, e as duas saídas podiam divergir
 * na hidratação.
 */

type No = DefaultTreeAdapterTypes.ChildNode;
type Elemento = DefaultTreeAdapterTypes.Element;

const TAGS_PERMITIDAS = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'strong',
  'u',
  'ul',
]);

const TAGS_VAZIAS = new Set(['br']);

// Tags cujo conteúdo nunca é texto exibível: são descartadas com tudo o que
// contêm.
const TAGS_DESCARTADAS_COM_CONTEUDO = new Set([
  'embed',
  'iframe',
  'math',
  'noembed',
  'noframes',
  'noscript',
  'object',
  'option',
  'plaintext',
  'script',
  'select',
  'style',
  'svg',
  'template',
  'textarea',
  'title',
  'xmp',
]);

const ORIGEM_BASE = 'https://lyra.local';

function escaparTexto(texto: string) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(' ', '&nbsp;');
}

function escaparAtributo(valor: string) {
  return escaparTexto(valor).replaceAll('"', '&quot;');
}

interface LinkSeguro {
  href: string;
  externo: boolean;
}

/**
 * Aceita links http(s), mailto, tel e caminhos relativos. O valor é avaliado
 * pelo mesmo parser de URL dos navegadores, depois da decodificação de
 * entidades feita pelo parse5 (`java&#115;cript:` já chega como
 * `javascript:` e é recusado).
 */
export function linkSeguro(hrefBruto: string): LinkSeguro | null {
  const href = hrefBruto.trim();
  if (!href) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(href, ORIGEM_BASE);
  } catch {
    return null;
  }

  if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
    return { href, externo: false };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  // Relativos (`/rota`, `#ancora`, `pagina`) resolvem na origem base; os
  // absolutos e os de protocolo relativo (`//site`, `/\site`) não.
  return { href, externo: url.origin !== ORIGEM_BASE };
}

function serializarFilhos(nos: readonly No[]): string {
  return nos.map(serializarNo).join('');
}

function serializarNo(no: No): string {
  if (no.nodeName === '#text' && 'value' in no) {
    return escaparTexto(no.value);
  }
  if (!('tagName' in no)) {
    // Comentários e doctype não são exibidos.
    return '';
  }

  const elemento: Elemento = no;
  // Conteúdo em namespace SVG/MathML não é texto exibível.
  if (
    TAGS_DESCARTADAS_COM_CONTEUDO.has(elemento.tagName) ||
    elemento.namespaceURI !== 'http://www.w3.org/1999/xhtml'
  ) {
    return '';
  }

  const conteudo = serializarFilhos(elemento.childNodes);
  const tag = elemento.tagName;
  if (!TAGS_PERMITIDAS.has(tag)) {
    return conteudo;
  }
  if (TAGS_VAZIAS.has(tag)) {
    return `<${tag}>`;
  }
  if (tag !== 'a') {
    return `<${tag}>${conteudo}</${tag}>`;
  }

  const href = elemento.attrs.find((atributo) => atributo.name === 'href');
  const link = href ? linkSeguro(href.value) : null;
  if (!link) {
    return `<a>${conteudo}</a>`;
  }
  const destino = escaparAtributo(link.href);
  return link.externo
    ? `<a href="${destino}" target="_blank" rel="noopener noreferrer">${conteudo}</a>`
    : `<a href="${destino}">${conteudo}</a>`;
}

export function sanitizarHtmlRichTextLyra(html: string) {
  if (!html.trim()) {
    return '';
  }
  return serializarFilhos(parseFragment(html).childNodes);
}
