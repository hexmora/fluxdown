import type { AnySlotPluggable } from '@fluxdown/react-base-presets/base';

import { MockNodeSlotPlugin } from './node';
import { MockParagraphSlotPlugin } from './paragraph';
import { MockShadSlotPlugin } from './shad';
import { MockStrongSlotPlugin } from './strong';
import { MockTexSlotPlugin } from './tex';

export * from './node';

export * from './paragraph';

export * from './shad';

export * from './strong';

export * from './tex';

export const MOCK_PRESET_SLOT_PLUGINS: AnySlotPluggable[] = [
  MockNodeSlotPlugin,
  MockParagraphSlotPlugin,
  MockShadSlotPlugin,
  MockStrongSlotPlugin,
  MockTexSlotPlugin,
];
