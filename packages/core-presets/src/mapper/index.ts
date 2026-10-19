import { Scale } from './scale';
import { Shad } from './shad';
import { Smooth } from './smooth';

export * from './smooth';
export * from './shad';
export * from './scale';

export const PRESET_MAPPER_PLUGINS = [Smooth, Shad, Scale];
