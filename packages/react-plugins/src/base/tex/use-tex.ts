import type { TexProps } from '@fluxdown/react-base-plugins/base';

import { useMemo } from 'react';

import type { TexRender, TexRenderResult } from './type';

import { TexPrefixParser } from './prefix';
import { isRepairingTex } from './utils';

/** Engine policy belongs to the slot plugin that owns its lazy renderer and macros. */
export const useTexRenderResult = (
  { current, mode = 'inline', tex }: TexProps,
  render: TexRender,
): TexRenderResult => {
  const parser = useMemo(
    () => new TexPrefixParser((source) => render(source, mode)),
    [mode, render],
  );

  const repairing = isRepairingTex(current);

  return useMemo(
    () => (repairing ? parser.parse(tex) : { tex, html: render(tex, mode) }),
    [mode, parser, render, repairing, tex],
  );
};
