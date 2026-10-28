import type { Component } from 'solid-js';

import type { TexProps } from '../../../../../base';

export type TexKatexRendererProps = TexProps & { Fallback?: Component<TexProps> };
