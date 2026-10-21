import { isPropsEqual as isBasePropsEqual } from '@fluxdown/react-base';

import type { FluxdownProps } from '../types';

const platformProps = ({
  text: _text,
  build: _build,
  streaming: _streaming,
  patches: _patches,
  plugins: _plugins,
  ...props
}: FluxdownProps) => props;

export const isPropsEqual = (left: FluxdownProps, right: FluxdownProps): boolean => {
  if (!isBasePropsEqual(left, right)) {
    return false;
  }

  const previous = platformProps(left);
  const next = platformProps(right);
  const keys = Object.keys(previous) as (keyof typeof previous)[];

  return (
    keys.length === Object.keys(next).length &&
    keys.every((key) => Object.is(previous[key], next[key]))
  );
};
