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

/** A subpixel positive advance prevents native text layout from dropping the attachment. */
export const INLINE_ADVANCE = 1 / 1024;

/** Paint the marker itself so a zero-width attachment cannot clip a child view. */
export const getInlineSuffixGeometry = (style: CSSProperties, type: 'cursor' | 'dot') => {
  const { height: lineHeight, cursorWidth } = getSuffixGeometry(style);

  const font = String(style.fontSize ?? '16px');

  const fontSize = parseFloat(font);

  const fontUnit = font.replace(/^[\d.]+/, '') || 'px';

  const lineUnit = lineHeight.replace(/^[\d.]+/, '');

  const markerSize = fontSize * (type === 'dot' ? 0.624 : 1);

  const height = `${markerSize}${fontUnit}`;

  const width = type === 'cursor' ? cursorWidth : height;

  const widthUnit = width.replace(/^[\d.]+/, '');

  const gap = fontSize * 0.18;

  const verticalMargin =
    lineUnit === fontUnit
      ? `${(parseFloat(lineHeight) - markerSize) / 2}${fontUnit}`
      : `calc(${parseFloat(lineHeight) / 2}${lineUnit} - ${markerSize / 2}${fontUnit})`;

  return {
    width,
    height,
    marginLeft: `${gap}${fontUnit}`,
    marginRight:
      widthUnit === fontUnit && fontUnit === 'px'
        ? `${-gap - parseFloat(width) + INLINE_ADVANCE}${fontUnit}`
        : `calc(${-gap}${fontUnit} - ${width} + ${INLINE_ADVANCE}px)`,
    marginTop: verticalMargin,
    marginBottom: verticalMargin,
  };
};
