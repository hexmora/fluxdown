import type { CSSProperties } from 'vue';

const getSize = (style: CSSProperties) => {
  const fontSize = Number.parseFloat(String(style.fontSize)) || 16;

  const lineHeight = Number.parseFloat(String(style.lineHeight)) || fontSize * 1.65;

  return { fontSize, lineHeight };
};

export const getRootStyle = (style: CSSProperties): CSSProperties => {
  const { lineHeight } = getSize(style);

  return {
    position: 'relative',
    overflow: 'visible',
    width: 0,
    height: `${lineHeight}px`,
    alignSelf: 'center',
  };
};

export const getMarkerStyle = (
  style: CSSProperties,
  type: string,
  opacity: number,
): CSSProperties => {
  const { fontSize, lineHeight } = getSize(style);

  const cursor = type === 'cursor';

  const height = cursor ? fontSize : fontSize * 0.624;

  return {
    position: 'absolute',
    left: `${fontSize * 0.18}px`,
    top: `${(lineHeight - height) / 2}px`,
    width: `${cursor ? (lineHeight * 0.39) / 1.65 : height}px`,
    height: `${height}px`,
    borderRadius: `${fontSize * (cursor ? 0.06 : 0.312)}px`,
    backgroundColor: style.color,
    opacity,
  };
};
