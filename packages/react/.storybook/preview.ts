import type { Preview } from '@storybook/react-vite';

import * as theme from './theme-addon';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    ...theme.globalTypes,
  },
  initialGlobals: {
    ...theme.initialGlobals,
  },
  decorators: [...theme.decorators],
};

export default preview;
