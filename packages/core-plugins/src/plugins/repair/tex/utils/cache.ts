import { findLast } from 'lodash-es';

import type { TexMode, TexRender } from '../type';

import { TexPrefixParser } from './prefix';

interface PrefixEntry {
  source: string;

  mode: TexMode;

  parser: TexPrefixParser;
}

/**
 * Each repair instance owns a bounded set of formula checkpoints. Matching the
 * entire raw prefix and mode makes reuse independent of document positions.
 */
export class TexPrefixCache {
  private entries: PrefixEntry[] = [];

  constructor(private render: TexRender) {}

  parse(source: string, mode: TexMode): string {
    const previous = findLast(
      this.entries,
      (entry) => entry.mode === mode && source.startsWith(entry.source),
    );

    const parser = previous?.parser ?? new TexPrefixParser((value) => this.render(value, mode));

    const result = parser.parse(source);

    this.entries = this.entries.filter((entry) => entry !== previous);

    if (source.length <= 32 * 1024) {
      this.entries.push({ source, mode, parser });

      this.entries = this.entries.slice(-16);
    }

    return result;
  }

  destroy(): void {
    this.entries = [];
  }
}
