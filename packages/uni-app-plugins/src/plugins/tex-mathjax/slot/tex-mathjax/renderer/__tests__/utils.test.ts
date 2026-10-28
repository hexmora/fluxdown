import { renderFormula } from '../utils';

describe('headless MathJax', () => {
  test('renders self-contained SVG with concrete dimensions and theme color', () => {
    const formula = renderFormula('E=mc^2', 'inline', 16, '#202123');

    expect(formula?.width).toBeGreaterThan(0);

    expect(formula?.height).toBeGreaterThan(0);

    const source = decodeURIComponent(formula?.src.split(',')[1] ?? '');

    expect(source).toContain('<path');

    expect(source).toContain('color="#202123"');

    expect(source).not.toContain('<script');
  });

  test('rejects malformed TeX and isolates macros between formulas', () => {
    expect(renderFormula('\\frac{', 'inline', 16, '#000000')).toBeNull();

    expect(
      renderFormula('\\newcommand{\\fluxword}{x}\\fluxword', 'inline', 16, '#000000'),
    ).not.toBeNull();

    expect(renderFormula('\\fluxword', 'inline', 16, '#000000')).toBeNull();
  });
});
