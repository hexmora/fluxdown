import type { MapperConfigInputs, MapperInputs } from '@fluxdown/types';

import type { ScaleAnimationConfig } from '../../type';

export type ScaleAnimationInputs = MapperConfigInputs<Required<ScaleAnimationConfig>>;

export type ScaleBlocksInputs = MapperInputs<ScaleAnimationInputs>;
