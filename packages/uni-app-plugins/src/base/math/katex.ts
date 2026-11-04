import { renderToString } from 'katex';

import type { SvgImageData } from '../components';

import { renderMathjaxFormula, renderMathmlFormula } from './mathjax';

export const renderKatexFormula = (
  source: string,
  mode: 'inline' | 'display',
  fontSize: number,
  color: string,
): SvgImageData | null => {
  try {
    const mathml = renderToString(source, {
      displayMode: mode === 'display',
      maxExpand: 1000,
      maxSize: 20,
      macros: {},
      output: 'mathml',
      strict: true,
      throwOnError: true,
      trust: false,
    });

    // KaTeX parses the formula; MathJax lays its MathML out as native-compatible SVG.
    return renderMathmlFormula(mathml, mode, fontSize, color);
  } catch {
    return null;
  }
};

export const renderMathjaxKatexFormula = (
  source: string,
  mode: 'inline' | 'display',
  fontSize: number,
  color: string,
): SvgImageData | null => {
  return (
    renderKatexFormula(source, mode, fontSize, color) ??
    renderMathjaxFormula(source, mode, fontSize, color)
  );
};
