import type { Meta, StoryObj } from '@storybook/react-native';

import { Playground } from '../components/playground';
import { STORY_MARKDOWN } from '../playgrounds/consts';

const meta = {
  component: Playground,
  title: 'Themes',
  args: {
    autoPlay: true,
    initialText: STORY_MARKDOWN,
  },
} satisfies Meta<typeof Playground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: { theme: 'light' },
};

export const Dark: Story = {
  args: { theme: 'dark' },
};
