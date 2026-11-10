import type { TexRenderResult, TexRenderSource } from './type';

/** A control word at EOF can still grow (for example, \not into \notin). */
export const getTexStreamEnd = (source: string): number => {
  let start = source.length;

  while (start > 0 && /[a-zA-Z@]/.test(source[start - 1]!)) {
    start -= 1;
  }

  let slash = start;

  while (slash > 0 && source[slash - 1] === '\\') {
    slash -= 1;
  }

  return (start - slash) % 2 === 1 ? start - 1 : source.length;
};

/** Cache accepted engine output per formula; TeX prefix validity is not monotone. */
export class TexPrefixParser {
  private source = '';

  private checked = 0;

  private end = 0;

  private html = '';

  constructor(private render: TexRenderSource) {}

  parse(source: string): TexRenderResult {
    const candidate = source.slice(0, getTexStreamEnd(source));

    if (!candidate.startsWith(this.source)) {
      this.checked = 0;

      this.end = 0;
    }

    // Each appended endpoint needs at most one engine validation.
    for (let end = candidate.length; end > this.checked; end -= 1) {
      const tex = candidate.slice(0, end);

      if (
        getTexStreamEnd(tex) < tex.length &&
        (tex.endsWith('\\') || /[a-zA-Z@]/.test(source[end] ?? ''))
      ) {
        continue;
      }

      const html = this.render(tex);

      if (html === null) {
        continue;
      }

      this.end = end;

      this.html = html;

      break;
    }

    this.source = candidate;

    this.checked = candidate.length;

    return { tex: candidate.slice(0, this.end), html: this.end > 0 ? this.html : '' };
  }
}
