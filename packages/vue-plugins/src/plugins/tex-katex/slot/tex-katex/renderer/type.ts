import type { Component } from 'vue';

import type { TexProps } from '../../../../../base';

export type TexKatexRendererProps = TexProps & { Fallback?: Component<TexProps> };
