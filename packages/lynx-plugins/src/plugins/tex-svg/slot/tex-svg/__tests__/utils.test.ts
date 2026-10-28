import { describe, expect, test } from '@rstest/core';

import { renderFormula } from '../renderer/utils';

describe('native SVG formulas', () => {
  test.each([
    'x^2 + y^2',
    String.raw`\frac{1}{\sqrt{2}}`,
    String.raw`\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix}`,
    String.raw`\int_0^1 x^2\,dx`,
    String.raw`\ce{H2O}`,
  ])('renders %s without a browser or remote font resources', (source) => {
    const formula = renderFormula(source, 'display', '#123456');

    expect(formula).not.toBeNull();
    expect(formula!.width).toBeGreaterThan(0);
    expect(formula!.height).toBeGreaterThan(0);
    expect(formula!.svg).toContain('<path');
    expect(formula!.svg).toContain('color="#123456"');
    expect(formula!.svg).not.toMatch(/<(?:foreignObject|use|script|image)\b/);
    expect(formula!.svg).not.toContain('data-mjx');
    expect(formula!.svg).not.toMatch(/(?:href|class|id)=/);
  });

  test('retains Unicode text when the MathJax font has no path for a character', () => {
    const formula = renderFormula(String.raw`\text{中文}+x`, 'inline', 'black');

    expect(formula?.svg).toContain('<text');
    expect(formula?.svg).toContain('中');
    expect(formula?.svg).toContain('文');
    expect(formula?.svg).toContain('<path');
  });

  test('isolates macros and returns source fallback for invalid expressions', () => {
    expect(renderFormula(String.raw`\newcommand{\foo}{x}\foo`, 'inline', 'black')).not.toBeNull();
    expect(renderFormula(String.raw`\foo`, 'inline', 'black')).toBeNull();
    expect(renderFormula(String.raw`\notACommand{x}`, 'inline', 'black')).toBeNull();
  });

  test('keeps formula colors without allowing links', () => {
    const colored = renderFormula(String.raw`\color{red}{x}+y`, 'inline', '#ffffff');

    expect(colored?.svg).toContain('fill="red"');
    expect(colored?.svg).toContain('color="#ffffff"');
    const linked = renderFormula(String.raw`\href{https://example.com}{x}`, 'inline', 'black');

    expect(linked?.svg ?? '').not.toContain('href=');
  });
});
