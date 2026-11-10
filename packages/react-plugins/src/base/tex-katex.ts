import { renderToString } from 'katex';

// Kept out of the base barrel so importing ordinary render slots stays lightweight.
export const katexTexToHtml = (tex: string, mode: 'display' | 'inline') => {
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
