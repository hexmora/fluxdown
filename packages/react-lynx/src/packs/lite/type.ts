import type { PartialBy } from '@fluxdown/utils';

import type { FluxdownRawProps } from '../raw';

export type FluxdownLiteProps = PartialBy<FluxdownRawProps, 'plugins'>;
