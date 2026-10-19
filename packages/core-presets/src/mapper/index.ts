import { Chunk } from './chunk';
import { Scale } from './scale';
import { Shad } from './shad';
import { Smooth } from './smooth';
import { Suffix } from './suffix';

export * from './smooth';
export * from './shad';
export * from './scale';
export * from './chunk';
export * from './suffix';

export const PRESET_MAPPER_PLUGINS = [Smooth, Shad, Scale, Chunk, Suffix];
