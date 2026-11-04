import type { IntrinsicElements as LynxElements } from '@lynx-js/types';
import type { VNode, VNodeChild, VNodeRef } from 'vue';

export { Fragment, h as jsx, h as jsxDEV, h as jsxs } from 'vue';

type NativeElements = {
  [K in keyof LynxElements]: Omit<LynxElements[K], 'children' | 'ref' | 'class'> & {
    children?: VNodeChild;

    class?: LynxElements['view']['class'];

    key?: string | number | symbol;

    ref?: VNodeRef;
  };
};

export namespace JSX {
  export interface Element extends VNode {}

  export interface ElementClass {
    $props: {};
  }

  export interface ElementAttributesProperty {
    $props: {};
  }

  export interface IntrinsicElements extends NativeElements {}

  export interface IntrinsicAttributes {
    key?: string | number | symbol;

    ref?: VNodeRef;
  }
}
