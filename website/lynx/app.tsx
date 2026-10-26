import type { FluxdownProps } from '@fluxdown/lynx';

import { Fluxdown } from '@fluxdown/lynx';
import { root, useInitData, useMemo } from '@lynx-js/react';

import type { LynxDemoData } from './type';

function Demo() {
  const { text, streaming, effect, smooth, dark, cycle } = useInitData() as LynxDemoData;

  const theme = useMemo<FluxdownProps['theme']>(
    () => [dark ? 'dark' : 'light', { tokens: { colors: { bg: 'transparent' } } }],
    [dark],
  );

  return (
    <Fluxdown key={cycle} text={text} streaming={streaming && { effect, smooth }} theme={theme} />
  );
}

root.render(<Demo />);
