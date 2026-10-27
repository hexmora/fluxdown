import type { Readable } from 'svelte/store';

import type { SveltePreviewProps } from '../../type';

export interface PreviewHostProps {
  source: Readable<SveltePreviewProps>;
}
