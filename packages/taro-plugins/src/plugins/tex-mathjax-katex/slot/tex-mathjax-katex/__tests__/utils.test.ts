/** @jest-environment node */
import { texToSvg } from '../renderer/components/mathjax-tex/utils';

const decodeSvg = (src: string) => {
  return decodeURIComponent(src.slice(src.indexOf(',') + 1));
};

describe('MathJax images without browser globals', () => {
  test.each(['inline', 'display'] as const)(
    'converts unsupported KaTeX syntax in %s mode',
    (mode) => {
      expect(typeof window).toBe('undefined');

      expect(typeof document).toBe('undefined');

      const formula = texToSvg(String.raw`\bbox[5px]{\frac{x}{y}}`, mode);

      expect(formula).not.toBeNull();

      expect(formula!.width).toMatch(/^\d+(?:\.\d+)?ex$/);

      expect(formula!.height).toMatch(/^\d+(?:\.\d+)?ex$/);

      expect(formula!.baseline).toMatch(/^-\d+(?:\.\d+)?ex$/);

      const svg = decodeSvg(formula!.src);

      expect(svg).toMatch(/^<svg /);

      expect(svg).toContain('viewBox=');

      expect(svg).toContain('<path');

      expect(svg).not.toMatch(/<mjx-container|<use\b|<script\b/);
    },
  );

  test('preserves the default viewport and host minimum width for numbered formulas', () => {
    const formula = texToSvg(
      String.raw`\begin{align}\bbox[5px]{a}&=b+c\tag{1}\\d&=e\end{align}`,
      'display',
    );

    expect(formula).not.toBeNull();

    expect(formula!.width).toBe('300px');

    expect(formula!.minWidth).toMatch(/^\d+(?:\.\d+)?ex$/);

    const svg = decodeSvg(formula!.src);

    expect(svg).toContain('data-mjx-viewBox=');

    expect(svg).toContain('data-table="true"');

    expect(svg).toContain('data-labels="true"');

    expect(svg).not.toContain('min-width');
  });

  test('applies the surrounding color without overriding explicit formula colors', () => {
    const formula = texToSvg(String.raw`\bbox[5px]{\color{red}{x}+y}`, 'inline', '#ececf1');

    const svg = decodeSvg(formula!.src);

    expect(svg).toContain('color="#ececf1"');

    expect(svg).toContain('fill="red"');

    expect(svg).toContain('fill="currentColor"');
  });

  test.each([
    String.raw`\unsupportedfluxdowncommand`,
    String.raw`\frac{`,
    String.raw`\def\loop{\loop}\loop`,
  ])('returns no image for an invalid expression', (tex) => {
    expect(texToSvg(tex, 'inline')).toBeNull();
  });

  test('removes URLs, class names and IDs supplied by formulas', () => {
    const formula = texToSvg(
      String.raw`\href{javascript:alert(1)}{\class{injected}{\cssId{injected}{x}}}`,
      'inline',
    );

    expect(formula).not.toBeNull();

    expect(decodeSvg(formula!.src)).not.toMatch(/\s(?:href|xlink:href|class|id)=/);
  });

  test('isolates macro definitions between formulas and modes', () => {
    expect(texToSvg(String.raw`\fluxdownmacro`, 'inline')).toBeNull();

    expect(
      texToSvg(String.raw`\newcommand{\fluxdownmacro}{x}\fluxdownmacro`, 'display'),
    ).not.toBeNull();

    expect(texToSvg(String.raw`\fluxdownmacro`, 'inline')).toBeNull();

    expect(texToSvg(String.raw`\fluxdownmacro`, 'display')).toBeNull();
  });
});
