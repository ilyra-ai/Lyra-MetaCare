import { parseFragment } from 'parse5';
import { describe, expect, it } from 'vitest';

import { linkSeguro, sanitizarHtmlRichTextLyra } from './rich-text';

const sanitizar = sanitizarHtmlRichTextLyra;

describe('sanitizarHtmlRichTextLyra', () => {
  it('mantém a formatação permitida', () => {
    expect(
      sanitizar(
        '<h2>Título</h2><p>Texto <strong>forte</strong>, <em>ênfase</em> e <u>sublinhado</u>.<br>Linha</p><ul><li>um</li></ul>'
      )
    ).toBe(
      '<h2>Título</h2><p>Texto <strong>forte</strong>, <em>ênfase</em> e <u>sublinhado</u>.<br>Linha</p><ul><li>um</li></ul>'
    );
  });

  it('não deixa um href com aspas virar atributo de evento', () => {
    const saida = sanitizar(
      `<a href='https://x.com/" onmouseover="alert(1)'>link</a>`
    );
    expect(saida).toBe(
      '<a href="https://x.com/&quot; onmouseover=&quot;alert(1)" target="_blank" rel="noopener noreferrer">link</a>'
    );
    // Reinterpretado como o navegador faria, o link só tem os três atributos.
    const [link] = parseFragment(saida).childNodes;
    expect(
      link && 'attrs' in link ? link.attrs.map((a) => a.name) : []
    ).toEqual(['href', 'target', 'rel']);
  });

  it('recusa javascript:, data: e esquemas ofuscados por entidades', () => {
    for (const href of [
      'javascript:alert(1)',
      ' JaVaScRiPt:alert(1)',
      'java&#115;cript:alert(1)',
      '&#x6A;avascript:alert(1)',
      'java\tscript:alert(1)',
      '\u0001javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
    ]) {
      expect(sanitizar(`<a href="${href}">x</a>`)).toBe('<a>x</a>');
    }
  });

  it('remove atributos e tags perigosas, descartando o conteúdo executável', () => {
    expect(
      sanitizar(
        '<p onclick="alert(1)" style="color:red">a<script>alert(1)</script><img src=x onerror=alert(1)>b</p><style>p{}</style><iframe src="https://x"></iframe><svg><a href="https://x">s</a></svg>'
      )
    ).toBe('<p>ab</p>');
  });

  it('desembrulha tags não permitidas mantendo o texto', () => {
    expect(sanitizar('<div><span class="x">texto</span></div>')).toBe('texto');
  });

  it('escapa o texto e remove comentários', () => {
    expect(sanitizar('<p>1 &lt; 2 &amp;&amp; &lt;b&gt;</p><!-- x -->')).toBe(
      '<p>1 &lt; 2 &amp;&amp; &lt;b&gt;</p>'
    );
  });

  it('trata HTML malformado como o navegador', () => {
    expect(sanitizar('<p><strong>sem fechar<p>outro')).toBe(
      '<p><strong>sem fechar</strong></p><p><strong>outro</strong></p>'
    );
    expect(sanitizar('<<script>alert(1)//<</script>')).toBe('&lt;');
  });

  it('marca links externos e preserva os internos', () => {
    expect(sanitizar('<a href="/planos#topo">a</a>')).toBe(
      '<a href="/planos#topo">a</a>'
    );
    expect(sanitizar('<a href="mailto:oi@lyra.app">b</a>')).toBe(
      '<a href="mailto:oi@lyra.app">b</a>'
    );
    expect(sanitizar('<a href="//evil.example">c</a>')).toBe(
      '<a href="//evil.example" target="_blank" rel="noopener noreferrer">c</a>'
    );
  });

  it('devolve vazio para entrada vazia', () => {
    expect(sanitizar('   ')).toBe('');
  });
});

describe('linkSeguro', () => {
  it('classifica relativos, externos e protocolo relativo com barra invertida', () => {
    expect(linkSeguro('#a')).toEqual({ href: '#a', externo: false });
    expect(linkSeguro('pagina')).toEqual({ href: 'pagina', externo: false });
    expect(linkSeguro('https://lyra.app')).toEqual({
      href: 'https://lyra.app',
      externo: true,
    });
    expect(linkSeguro('/\\evil.example')?.externo).toBe(true);
    expect(linkSeguro('tel:+5511999999999')?.externo).toBe(false);
    expect(linkSeguro('')).toBeNull();
  });
});
