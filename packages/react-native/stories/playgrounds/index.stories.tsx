import type { Meta, StoryObj } from '@storybook/react-native';

import { Playground } from '../components/playground';
import { STORY_MARKDOWN } from './consts';

const meta = {
  component: Playground,
  title: 'Playgrounds',
  args: {
    autoPlay: true,
    initialText: STORY_MARKDOWN,
  },
} satisfies Meta<typeof Playground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Paused: Story = {
  args: { autoPlay: false },
};

export const Empty: Story = {
  args: { initialText: '' },
};

export const IncompleteMarkdown: Story = {
  args: {
    initialText: '# 尚未完成的回答\n\n**先给出核心思路，再逐渐补充\n\n```ts\nconst answer =',
  },
};
