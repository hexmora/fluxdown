import type { FluxdownRawProps } from '@fluxdown/angular/raw';
import type { PartialBy } from '@fluxdown/utils';

export type FluxdownLiteProps = PartialBy<FluxdownRawProps, 'plugins'>;
