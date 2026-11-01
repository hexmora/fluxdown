import type { Theme } from 'fluxdown';

import { Fluxdown as FluxdownNative } from '@fluxdown/react-native';
import { Fluxdown } from 'fluxdown';
import { useMemo } from 'react';

import type { RendererPreviewProps } from './type';

import { useLocale } from '../../../hooks';
import { AngularPreview } from './components/angular-preview';
import { LynxPreview } from './components/lynx-preview';
import { SolidPreview } from './components/solid-preview';
import { SveltePreview } from './components/svelte-preview';
import { TaroPreview } from './components/taro-preview';
import { VuePreview } from './components/vue-preview';

export const RendererPreview = ({
  renderer,
  text,
  streaming = false,
  scrollMode = 'static',
  build,
  dark,
  cycle = 0,
  reducedMotion = false,
}: RendererPreviewProps) => {
  const { lang } = useLocale();

  const theme = useMemo(
    () => [dark ? 'dark' : 'light', { tokens: { colors: { bg: 'transparent' } } }] satisfies Theme,
    [dark],
  );

  const data = useMemo(
    () => ({
      text,
      options: JSON.stringify({ streaming, build }),
      dark,
      cycle,
      reducedMotion,
      scrollMode,
    }),
    [text, streaming, build, dark, cycle, reducedMotion, scrollMode],
  );

  const props = { text, streaming, build, theme };

  if (renderer === 'lynx') {
    return (
      <LynxPreview
        data={data}
        errorLabel={
          lang === 'zh'
            ? 'Lynx 预览加载失败，请刷新页面重试。'
            : 'The Lynx preview could not load. Refresh the page to try again.'
        }
      />
    );
  }

  if (renderer === 'angular') {
    return <AngularPreview key={cycle} {...props} />;
  }

  if (renderer === 'solid') {
    return <SolidPreview key={cycle} {...props} />;
  }

  if (renderer === 'vue') {
    return <VuePreview key={cycle} {...props} />;
  }

  if (renderer === 'svelte') {
    return <SveltePreview key={cycle} {...props} />;
  }

  if (renderer === 'taro') {
    return <TaroPreview key={cycle} {...props} />;
  }

  if (renderer === 'react-native') {
    return <FluxdownNative key={cycle} {...props} />;
  }

  return <Fluxdown key={cycle} {...props} />;
};

export * from './consts';
export type * from './type';
