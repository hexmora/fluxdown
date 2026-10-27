/** @jest-environment node */

import { renderFormula } from '../renderer/components/svg/utils';

describe('native SVG formulas', () => {
  test.each([
    String.raw`\frac{1}{2} + \sqrt{x}`,
    String.raw`\begin{aligned}a&=b+c\\d&=e\end{aligned}`,
    String.raw`\ce{H2O}`,
    String.raw`\qty(\frac{x}{y})`,
    String.raw`\bbox[red]{\cancel{x}}`,
  ])('renders %s without browser globals', (source) => {
    const formula = renderFormula(source, 'display', 16);

    expect(formula?.svg).toMatch(/^<svg /);

    expect(formula?.svg).toContain('<path');

    expect(formula?.svg).not.toMatch(/<mjx-container|data-[\w-]+=|<foreignObject/);

    expect(formula?.svg).not.toContain('vertical-align');

    expect(formula?.width).toBeGreaterThan(0);

    expect(formula?.height).toBeGreaterThan(0);
  });

  test('scales dimensions with the surrounding text size', () => {
    const normal = renderFormula('x^2', 'inline', 16)!;

    const large = renderFormula('x^2', 'inline', 32)!;

    expect(large.width).toBeCloseTo(normal.width * 2);

    expect(large.height).toBeCloseTo(normal.height * 2);
  });

  test('keeps every term when an inline expression contains a breakpoint', () => {
    const inline = renderFormula('E=mc^2', 'inline', 16)!;

    const display = renderFormula('E=mc^2', 'display', 16)!;

    expect(inline.svg.match(/<path /g)).toHaveLength(5);

    expect(inline.width).toBeCloseTo(display.width);
  });

  test('removes user links and CSS from base TeX token attributes while keeping the formula', () => {
    const formula = renderFormula(
      String.raw`\mmlToken{mi}[href="javascript:alert(1)" style="color:red;position:fixed"]{X}`,
      'inline',
      16,
    );

    expect(formula?.svg).toContain('<path');

    expect(formula?.svg).not.toMatch(/<a | (?:href|style)=["']/);
  });

  test('rejects unfinished input and isolates definitions across formulas', () => {
    expect(renderFormula(String.raw`\frac{`, 'inline', 16)).toBeNull();

    expect(
      renderFormula(String.raw`\def\fluxdownnative{shared}\fluxdownnative`, 'inline', 16),
    ).not.toBeNull();

    expect(renderFormula(String.raw`\fluxdownnative`, 'inline', 16)).toBeNull();
  });
});
