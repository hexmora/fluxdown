import type { FluxdownProps } from '@fluxdown/lynx';

import { Fluxdown } from '@fluxdown/lynx';
import { root, useInitData, useMemo } from '@lynx-js/react';

import type { LynxDemoData } from './type';

function Demo() {
  const { text, options, dark, cycle } = useInitData() as LynxDemoData;

  const { build, streaming } = useMemo(
    () => JSON.parse(options) as Pick<FluxdownProps, 'build' | 'streaming'>,
    [options],
  );

  const theme = useMemo<FluxdownProps['theme']>(
    () => [dark ? 'dark' : 'light', { tokens: { colors: { bg: 'transparent' } } }],
    [dark],
  );

  return <Fluxdown key={cycle} text={text} build={build} streaming={streaming} theme={theme} />;
}

root.render(<Demo />);
