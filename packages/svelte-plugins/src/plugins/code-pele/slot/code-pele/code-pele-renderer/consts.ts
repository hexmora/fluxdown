import type { RenderOptions } from 'pele';

export const DIAGRAM_OPTIONS: RenderOptions = {
  fontSize: 14,
  images: false,
  links: false,
  measurer: {
    width(text, size, style) {
      let width = 0;

      for (const char of text) {
        width += char.charCodeAt(0) > 255 || /[MWmw@#%&]/.test(char) ? 1 : 0.75;
      }

      return width * size * (style & 1 ? 1.05 : 1);
    },
  },
};
