import type { MapperConfigInputs, MapperInputs } from '@fluxdown/types';

import type { ShadAnimationConfig } from '../../type';

export type ShadAnimationInputs = MapperConfigInputs<Required<ShadAnimationConfig>>;

export type ShadBlocksInputs = MapperInputs<ShadAnimationInputs>;
