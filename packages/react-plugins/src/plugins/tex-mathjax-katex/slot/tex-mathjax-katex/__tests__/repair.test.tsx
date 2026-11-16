import type { Element, Nodes } from 'hast';

import { ApplyRepairsRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/apply-repairs';
import { SyntaxMathRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-math';
import { TexRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/tex';
import { render, waitFor } from '@testing-library/react';

import { MarkdownCompiler } from '../../../../../../../core/src/states/hast/block-compiler/exports';
import { katexTexToHtml } from '../../../../tex-katex/utils';
import { texToSvg } from '../../../utils';
import { TexMathjaxKatexRenderer } from '../renderer';

const current: Element = {
  type: 'element',
  tagName: 'span',
  properties: { dataType: 'inline-math' },
  children: [{ type: 'text', value: '', data: { repairEnding: true } }],
};

const props = {
  Raw: null,
  current,
  parents: [],
  render: () => null,
};

const renderTex = (tex: string) => {
  return katexTexToHtml(tex, 'inline') ?? texToSvg(tex, 'inline');
};

const getText = (node: Nodes): string => {
  return 'value' in node
    ? node.value
    : 'children' in node
      ? node.children.map(getText).join('')
      : '';
};

const createPrefixRepair = () => {
  const repair = new TexRepairPlugin({ render: renderTex });
  const compiler = new MarkdownCompiler();
  const remarks = [
    new SyntaxMathRemarkPlugin({ repairEnding: true }),
    new ApplyRepairsRemarkPlugin({ plugins: [repair], ending: true }),
  ];

  return (source: string): string =>
    source ? getText(compiler.build({ text: `$${source}`, remarks })) : '';
};

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
    const prefix = createPrefixRepair();
    let previous = '';

    for (let end = 0; end <= source.length; end += 1) {
      const result = prefix(source.slice(0, end));

      expect(source.startsWith(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(previous.length);

      if (result) {
        expect(renderTex(result)).not.toBeNull();
      }

      previous = result;
    }

    expect(previous).toBe(source);
  });

  test('does not show a shorter command while a longer control word is arriving', () => {
    const prefix = createPrefixRepair();

    expect(prefix(String.raw`x+\sin`)).toBe('x+');
    expect(prefix(String.raw`x+\sinh`)).toBe('x+');
    expect(prefix(String.raw`x+\sinh `)).toBe(String.raw`x+\sinh `);
  });

  test('does not leak macro definitions into another validation context', () => {
    const prefix = createPrefixRepair();

    expect(prefix(String.raw`\gdef\privatefoo{x}\privatefoo `)).toBe(
      String.raw`\gdef\privatefoo{x}\privatefoo `,
    );
    expect(prefix(String.raw`\privatefoo `)).toBe('');
  });

  test('renders its received source without performing repair, even with repair metadata', async () => {
    const tex = String.raw`x+\frac{a}{`;

    const view = render(<TexMathjaxKatexRenderer {...props} tex={tex} />);

    await waitFor(
      () => {
        expect(view.container.textContent).toBe(tex);

        expect(view.container.querySelector('[data-formula-error="true"]')).not.toBeNull();
      },
      { timeout: 10_000 },
    );
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
