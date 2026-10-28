import type { JSX } from 'solid-js';

import { Show, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { ElementProps } from '../../../../../base';

import { isSafeTagName } from '../../../../../base';
import { VOID_TAG_NAMES } from './consts';

export const ElementRenderer = (props: ElementProps) => {
  const [local, elementProps] = splitProps(props, ['Raw', 'children', 'tagName']);

  return (
    <Show when={isSafeTagName(local.tagName)}>
      <Dynamic component={local.tagName as keyof JSX.IntrinsicElements} {...elementProps}>
        {VOID_TAG_NAMES.includes(local.tagName) ? undefined : local.children}
      </Dynamic>
    </Show>
  );
};
