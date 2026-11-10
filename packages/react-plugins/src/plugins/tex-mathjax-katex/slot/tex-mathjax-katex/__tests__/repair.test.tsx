import type { Element } from 'hast';

import { render, waitFor } from '@testing-library/react';

import { TexPrefixParser } from '../../../../../base';
import { katexTexToHtml } from '../../../../../base/tex-katex';
import { texToSvg } from '../mathjax';
import { TexMathjaxKatexRenderer } from '../renderer';

const current: Element = {
  type: 'element',
  tagName: 'span',
  properties: { dataType: 'inline-math' },
  children: [{ type: 'text', value: '', data: { repairEnding: true } }],
};

const props = { Raw: null, current, parents: [], render: () => null };

const renderTex = (tex: string) => katexTexToHtml(tex, 'inline') ?? texToSvg(tex, 'inline');

describe('streaming TeX prefixes', () => {
  test.each([
    String.raw`x+\frac{a+b}{c+d}`,
    String.raw`x+\sqrt[3]{1+x^{2}}`,
    String.raw`x+\begin{pmatrix}1&2\\3&4\end{pmatrix}`,
    String.raw`x+\left(\frac{a}{b}\right)`,
    String.raw`x+\bbox[5px]{y}`,
    String.raw`x+\ce{H2O}`,
    String.raw`\newcommand{\pair}[2]{#1+#2}\pair{a}{b}`,
    String.raw`\def\foo#1{#1^2}\foo{x}`,
    String.raw`x+\verb|{not a group}|`,
    String.raw`x+\text{中文与 spaces}`,
  ])('never returns invalid TeX or loses an accepted prefix: %s', (source) => {
    const prefix = new TexPrefixParser(renderTex);
    let previous = '';

    for (let end = 0; end <= source.length; end += 1) {
      const result = prefix.parse(source.slice(0, end));

      expect(source.startsWith(result.tex)).toBe(true);
      expect(result.tex.length).toBeGreaterThanOrEqual(previous.length);
      expect(result.html).not.toContain('data-mjx-error');

      if (result.tex) {
        expect(renderTex(result.tex)).not.toBeNull();
      }

      previous = result.tex;
    }

    expect(previous).toBe(source);
  });

  test('does not show a shorter command while a longer control word is arriving', () => {
    const prefix = new TexPrefixParser(renderTex);

    expect(prefix.parse(String.raw`x+\sin`).tex).toBe('x+');
    expect(prefix.parse(String.raw`x+\sinh`).tex).toBe('x+');
    expect(prefix.parse(String.raw`x+\sinh `).tex).toBe(String.raw`x+\sinh `);
  });

  test('does not leak macro definitions into another validation context', () => {
    const prefix = new TexPrefixParser(renderTex);

    expect(prefix.parse(String.raw`\gdef\privatefoo{x}\privatefoo `).tex).toBe(
      String.raw`\gdef\privatefoo{x}\privatefoo `,
    );
    expect(prefix.parse(String.raw`\privatefoo `).tex).toBe('');
  });

  test('holds raw source during loading and keeps valid math while arguments arrive', async () => {
    const view = render(<TexMathjaxKatexRenderer {...props} tex={'x+\\frac{a}{'} />);

    expect(view.container.textContent).not.toContain('frac');

    await waitFor(() => expect(view.container.querySelector('[data-tex="x+"]')).not.toBeNull(), {
      timeout: 10_000,
    });

    for (const tex of ['x+\\frac{a}{b', 'x+\\frac{a}{b}', 'x+\\frac{a}{b}+\\sq']) {
      view.rerender(<TexMathjaxKatexRenderer {...props} tex={tex} />);

      expect(view.container.querySelector('.katex, mjx-container')).not.toBeNull();
      expect(view.container.querySelector('[data-formula-error]')).toBeNull();
      expect(view.container.querySelector('.katex-html')?.textContent ?? '').not.toContain('frac');
    }

    const completed = { ...current, children: [] };

    view.rerender(
      <TexMathjaxKatexRenderer {...props} current={completed} tex={'\\notACommand{'} />,
    );

    expect(view.container.textContent).toBe('\\notACommand{');
  }, 15_000);

  test('keeps display formulas inside phrasing parents valid HTML', async () => {
    const parent: Element = { type: 'element', tagName: 'p', properties: {}, children: [] };
    const view = render(
      <p>
        <TexMathjaxKatexRenderer {...props} mode="display" parents={[parent]} tex="x+1" />
      </p>,
    );

    await waitFor(() => expect(view.container.querySelector('.katex')).not.toBeNull());

    expect(view.container.querySelector('p > div')).toBeNull();
    expect(view.container.querySelector('p > span[data-mode="display"]')).not.toBeNull();
  });
});
