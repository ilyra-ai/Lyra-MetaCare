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

function hrefSeguro(href: string) {
  const valor = href.trim();

  if (!valor) {
    return null;
  }

  if (
    valor.startsWith('/') ||
    valor.startsWith('#') ||
    valor.startsWith('mailto:') ||
    valor.startsWith('tel:')
  ) {
    return valor;
  }

  try {
    const url = new URL(valor, 'https://lyra.local');

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return valor;
    }
  } catch {
    return null;
  }

  return null;
}

function sanitizarNoDom(no: Node, documento: Document): Node | null {
  if (no.nodeType === Node.TEXT_NODE) {
    return documento.createTextNode(no.textContent ?? '');
  }

  if (no.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const elemento = no as HTMLElement;
  const tag = elemento.tagName.toLowerCase();
  const fragmento = documento.createDocumentFragment();

  for (const filho of Array.from(elemento.childNodes)) {
    const filhoSanitizado = sanitizarNoDom(filho, documento);

    if (filhoSanitizado) {
      fragmento.appendChild(filhoSanitizado);
    }
  }

  if (!TAGS_PERMITIDAS.has(tag)) {
    return fragmento;
  }

  const elementoSeguro = documento.createElement(tag);

  if (tag === 'a') {
    const href = hrefSeguro(elemento.getAttribute('href') ?? '');

    if (href) {
      elementoSeguro.setAttribute('href', href);

      const isExterno =
        href.startsWith('http://') || href.startsWith('https://');

      if (isExterno) {
        elementoSeguro.setAttribute('target', '_blank');
        elementoSeguro.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  elementoSeguro.appendChild(fragmento);
  return elementoSeguro;
}

function sanitizarComDomParser(html: string) {
  const parser = new DOMParser();
  const documento = parser.parseFromString(html, 'text/html');
  const saida = document.implementation.createHTMLDocument('');
  const fragmento = saida.createDocumentFragment();

  for (const no of Array.from(documento.body.childNodes)) {
    const noSanitizado = sanitizarNoDom(no, saida);

    if (noSanitizado) {
      fragmento.appendChild(noSanitizado);
    }
  }

  const container = saida.createElement('div');
  container.appendChild(fragmento);
  return container.innerHTML;
}

function sanitizarFallbackNoServidor(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      ''
    )
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|meta|link)\b[^>]*\/?>/gi,
      ''
    )
    .replace(/\s+on[a-z-]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(
      /<\/?([a-z0-9-]+)([^>]*)>/gi,
      (tagCompleta, tagBruta: string, atributosBrutos: string) => {
        const tag = tagBruta.toLowerCase();

        if (!TAGS_PERMITIDAS.has(tag)) {
          return '';
        }

        if (tagCompleta.startsWith('</')) {
          return `</${tag}>`;
        }

        if (tag !== 'a') {
          return `<${tag}>`;
        }

        const hrefMatch =
          atributosBrutos.match(/href\s*=\s*"([^"]*)"/i) ??
          atributosBrutos.match(/href\s*=\s*'([^']*)'/i) ??
          atributosBrutos.match(/href\s*=\s*([^\s>]+)/i);
        const href = hrefSeguro(hrefMatch?.[1] ?? '');

        if (!href) {
          return '<a>';
        }

        const isExterno =
          href.startsWith('http://') || href.startsWith('https://');

        return isExterno
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer">`
          : `<a href="${href}">`;
      }
    );
}

export function sanitizarHtmlRichTextLyra(html: string) {
  if (!html.trim()) {
    return '';
  }

  if (
    typeof DOMParser !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof Node !== 'undefined'
  ) {
    return sanitizarComDomParser(html);
  }

  return sanitizarFallbackNoServidor(html);
}
