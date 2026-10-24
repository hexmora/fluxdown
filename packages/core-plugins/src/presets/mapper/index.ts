import { Chunk } from '../../plugins/mapper/chunk';
import { Scale } from '../../plugins/mapper/scale';
import { Shad } from '../../plugins/mapper/shad';
import { Smooth } from '../../plugins/mapper/smooth';
import { Suffix } from '../../plugins/mapper/suffix';

export const PRESET_MAPPER_PLUGINS = [Smooth, Shad, Scale, Chunk, Suffix];
