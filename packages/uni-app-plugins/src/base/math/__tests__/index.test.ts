import { renderMathjaxFormula as renderFormula, renderKatexFormula, renderMathmlFormula } from '..';

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

describe('KaTeX MathML rendered as SVG', () => {
  test('uses no browser DOM and produces self-contained paths for fractions and matrices', () => {
    vi.stubGlobal('document', undefined);

    try {
      for (const source of [
        'E=mc^2',
        '\\frac{a}{b}+\\sqrt{x}',
        '\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}',
      ]) {
        const formula = renderKatexFormula(source, 'display', 20, '#115588');

        expect(formula?.width).toBeGreaterThan(0);

        expect(formula?.height).toBeGreaterThan(0);

        const svg = decodeURIComponent(formula?.src.split(',')[1] ?? '');

        expect(svg).toContain('<path');

        expect(svg).toContain('color="#115588"');

        expect(svg).not.toMatch(/<foreignObject|<script|href=/);
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('retains KaTeX parsing semantics and leaves unsupported TeX for MathJax', () => {
    const source = '\\ce{H2O}';

    expect(renderKatexFormula(source, 'inline', 16, '#202123')).toBeNull();

    expect(renderFormula(source, 'inline', 16, '#202123')).not.toBeNull();

    expect(renderKatexFormula('\\frac{', 'inline', 16, '#202123')).toBeNull();

    expect(renderMathmlFormula('<span>not math</span>', 'inline', 16, '#202123')).toBeNull();
  });

  test('isolates macros and scales concrete dimensions with the inherited font size', () => {
    expect(
      renderKatexFormula('\\gdef\\fluxword{x}\\fluxword', 'inline', 16, '#202123'),
    ).not.toBeNull();

    expect(renderKatexFormula('\\fluxword', 'inline', 16, '#202123')).toBeNull();

    const small = renderKatexFormula('x^2', 'inline', 16, '#202123')!;

    const large = renderKatexFormula('x^2', 'inline', 32, '#202123')!;

    expect(large.width).toBeCloseTo(small.width * 2);

    expect(large.height).toBeCloseTo(small.height * 2);
  });
});
