import type { Meta, StoryObj } from 'storybook-lynx-rsbuild';

import { createLynxView } from 'storybook-lynx-rsbuild';

import type { PlaygroundArgs } from './consts';

import { STORY_MARKDOWN } from './consts';

const meta = {
  title: 'Lynx/Playground',
  args: {
    text: STORY_MARKDOWN,
    streaming: false,
    pack: 'full',
    effect: 'scale',
    smooth: true,
    theme: 'light',
  },
  argTypes: {
    text: { control: 'text' },
    streaming: { control: 'boolean' },
    pack: { control: 'select', options: ['full', 'lite'] },
    effect: { control: 'select', options: ['none', 'scale', 'shad', 'chunk', 'suffix'] },
    smooth: { control: 'boolean' },
    theme: { control: 'select', options: ['light', 'dark'] },
  },
  render: (args, context) =>
    createLynxView({
      args,
      bundleUrl: './lynx/playground.web.bundle',
      canvasElement: context.canvasElement,
      width: '100%',
      height: '100vh',
    }),
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Full: Story = {};
export const Lite: Story = { args: { pack: 'lite' } };
export const Streaming: Story = { args: { streaming: true } };
