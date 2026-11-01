import type { FluxdownRawProps } from '@fluxdown/angular/raw';
import type { PartialBy } from '@fluxdown/utils';

export type FluxdownProps = PartialBy<FluxdownRawProps, 'plugins'>;
