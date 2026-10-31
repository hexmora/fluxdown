import type { PartialBy } from '@fluxdown/utils';

import type { FluxdownRawProps } from '../raw/type';

export type FluxdownLiteProps = PartialBy<FluxdownRawProps, 'plugins'>;
