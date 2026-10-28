import type { CSSProperties } from 'vue';

import type { InlineCanvasProps, Size } from './type';

import { BLUR_GROUPS } from './consts';

export const getFontSize = (style: CSSProperties) => parseFloat(String(style.fontSize ?? 16));

export const getProgress = (start: number, duration: number, now: number) =>
  start < 0 || duration <= 0 ? 1 : Math.min(1, Math.max(0, (now - start) / duration));

export const drawText = (
  context: CanvasRenderingContext2D,
  props: InlineCanvasProps,
  size: Size,
  padding: number,
  pixelRatio: number,
  progress: number,
) => {
  const { text, textStyle, from, blur, maskText, trailingText = '' } = props;

  const masked = maskText !== undefined;

  const fontSize = getFontSize(textStyle);

  const eased = 1 - Math.pow(1 - progress, 3);

  const scale = from + (1 - from) * eased;

  const opacity = Number(textStyle.opacity ?? 1);

  const radius = blur * fontSize * Math.cos((progress * Math.PI) / 2);

  // Resizing a native canvas resets its state stack; each frame starts explicitly.
  context.setTransform(1, 0, 0, 1, 0, 0);

  context.clearRect(
    0,
    0,
    Math.ceil((size.width + padding * 2) * pixelRatio),
    Math.ceil((size.height + padding * 2) * pixelRatio),
  );

  if (scale === 0) {
    return;
  }

  context.fillStyle = String(textStyle.color ?? '#202123');

  const maskWidth = maskText === undefined ? 0 : context.measureText(maskText).width;

  context.setTransform(
    pixelRatio * scale,
    0,
    0,
    pixelRatio * scale,
    (padding + size.width / 2) * pixelRatio,
    (padding + size.height) * pixelRatio,
  );

  const x = -size.width / 2;

  const y = -size.height / 2;

  if (radius < 0.05 || masked) {
    context.globalCompositeOperation = 'source-over';

    context.globalAlpha = opacity * (masked ? 1 : eased * eased);

    context.fillText(text, x, y);
  } else {
    // App canvas has no blur filter; additive samples preserve the glyph's alpha.
    context.globalCompositeOperation = 'lighter';

    for (const group of BLUR_GROUPS) {
      context.globalAlpha = opacity * eased * eased * group.weight;

      for (const sample of group.samples) {
        context.fillText(text, x + (sample.x * radius) / scale, y + (sample.y * radius) / scale);
      }
    }
  }

  if (maskWidth > 0) {
    const maskEnd = padding + context.measureText(text + trailingText).width;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    context.globalAlpha = 1;

    context.globalCompositeOperation = 'destination-in';

    const gradient = context.createLinearGradient(maskEnd - maskWidth, 0, maskEnd, 0);

    gradient.addColorStop(0, '#000000');

    gradient.addColorStop(1, 'transparent');

    context.fillStyle = gradient;

    context.fillRect(0, 0, size.width + padding * 2, size.height + padding * 2);
  }
};
