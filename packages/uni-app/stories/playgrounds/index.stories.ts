import type { Meta, StoryObj } from '@storybook/vue3-vite';

interface PreviewArgs {
  effect: 'static' | 'scale' | 'shad' | 'chunk' | 'suffix';

  theme: 'light' | 'dark';

  pack: 'full' | 'lite';

  scenario: 'default' | 'slot' | 'patch' | 'theme';
}

const meta = {
  title: 'Playgrounds',
  args: { effect: 'static', theme: 'light', pack: 'full', scenario: 'default' },
  argTypes: {
    effect: { options: ['static', 'scale', 'shad', 'chunk', 'suffix'], control: 'select' },
    theme: { options: ['light', 'dark'], control: 'select' },
    pack: { options: ['full', 'lite'], control: 'select' },
    scenario: { options: ['default', 'slot', 'patch', 'theme'], control: 'select' },
  },
  render: (args) => {
    return {
      setup() {
        return { args };
      },
      template: `<iframe
        :key="[args.effect, args.theme, args.pack, args.scenario].join(':')"
        :src="'./uni-app/#/pages/index/index?effect=' + args.effect + '&theme=' + args.theme + '&pack=' + args.pack + '&scenario=' + args.scenario"
        title="uni-app x"
        style="width:100%;height:760px;border:0"
      />`,
    };
  },
} satisfies Meta<PreviewArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Lite: Story = { args: { pack: 'lite' } };

export const Dark: Story = { args: { theme: 'dark' } };

export const Scale: Story = { args: { effect: 'scale' } };

export const Shad: Story = { args: { effect: 'shad' } };

export const Chunk: Story = { args: { effect: 'chunk' } };

export const Suffix: Story = { args: { effect: 'suffix' } };

export const Slot: Story = { args: { scenario: 'slot' } };

export const Patch: Story = { args: { scenario: 'patch' } };

export const CustomTheme: Story = { args: { scenario: 'theme' } };

export const DarkCustomTheme: Story = { args: { scenario: 'theme', theme: 'dark' } };
