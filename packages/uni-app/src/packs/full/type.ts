import type { PartialBy } from '@fluxdown/utils';

import type { FluxdownRawProps } from '../raw';

export type FluxdownProps = PartialBy<FluxdownRawProps, 'plugins'>;
