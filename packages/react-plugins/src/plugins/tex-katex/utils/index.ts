import { renderToString } from 'katex';

/**
 * Shared by the matching repair and renderer; ordinary base slots do not import this engine.
 */
export const katexTexToHtml = (tex: string, mode: 'display' | 'inline') => {
  if (!tex) {
    return '';
  }

  try {
    return renderToString(tex, {
      displayMode: mode === 'display',
      maxExpand: 1000,
      maxSize: 20,
      output: 'htmlAndMathml',
      strict: true,
      throwOnError: true,
      trust: false,
    });
  } catch {
    return null;
  }
};
