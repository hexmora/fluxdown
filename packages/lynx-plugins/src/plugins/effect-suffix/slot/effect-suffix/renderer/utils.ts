import type { CSSProperties } from '@lynx-js/types';

/** Lynx has no `lh` unit; resolve the marker from the same font and line height as its text. */
export const getSuffixGeometry = ({ fontSize = '16px', lineHeight = 1.65 }: CSSProperties) => {
  const font = String(fontSize);

  const line = String(lineHeight);

  const unit = font.replace(/^[\d.]+/, '') || 'px';

  const relative = /^[\d.]+$/.test(line);

  const lineUnit = relative ? unit : line.replace(/^[\d.]+/, '');

  const size = relative ? parseFloat(font) * Number(line) : parseFloat(line);

  return { height: `${size}${lineUnit}`, cursorWidth: `${(size * 0.39) / 1.65}${lineUnit}` };
};
