import type { Component } from 'svelte';

import type { TexProps } from '../../../../../base';

export type TexKatexRendererProps = TexProps & { Fallback?: Component<TexProps> };
