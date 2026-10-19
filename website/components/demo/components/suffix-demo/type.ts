import type { COPY } from './consts';

export type SuffixDemoType = 'cursor' | 'dot' | 'smile';

export type SuffixDemoSample = keyof (typeof COPY)['en']['samples'];
