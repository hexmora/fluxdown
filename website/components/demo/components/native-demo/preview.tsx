import type { Theme } from '@fluxdown/react-native';

import { Fluxdown } from '@fluxdown/react-native';
import { PRESET_LIGHT_PLUGINS } from '@fluxdown/react-native-presets/lite';
import { FluxdownLite } from '@fluxdown/react-native/lite';
import { FluxdownRaw } from '@fluxdown/react-native/raw';

import type { NativePreviewProps } from './type';

import { FONT_FAMILY } from './consts';

const typography = { text: { fontFamily: FONT_FAMILY, fontSize: 16, lineHeight: 26.4 } };

export const NativePreview = ({ pack, dark, streaming, text }: NativePreviewProps) => {
  const props = {
    build: { tex: true },
    selectable: true,
    streaming,
    text,
    styles: typography,
    theme: [
      dark ? 'dark' : 'light',
      {
        colors: {
          text: 'var(--site-ink)',
          muted: 'var(--site-muted)',
          background: 'var(--site-surface)',
          link: 'var(--site-accent)',
        },
      },
    ] satisfies Theme,
  };

  if (pack === 'raw') {
    return <FluxdownRaw {...props} plugins={PRESET_LIGHT_PLUGINS} />;
  }

  const Component = pack === 'lite' ? FluxdownLite : Fluxdown;

  return <Component {...props} />;
};
