import type {
  AngularComponentNode,
  AngularRenderNode,
  AngularSlotNode,
  SlotInputProps,
  SlotProps,
  Slots,
  SlotType,
} from '@fluxdown/angular-plugins/typings';

import { HOST_ATTRIBUTES, UNITLESS_STYLES } from './consts';

export const flattenNodes = (
  node: AngularRenderNode,
): Exclude<AngularRenderNode, boolean | null | undefined | AngularRenderNode[]>[] => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return [];
  }

  if (Array.isArray(node)) {
    return node.flatMap(flattenNodes);
  }

  return [node];
};

export const composeSlot = (
  type: SlotType,
  props: SlotInputProps,
  slots: Partial<Slots>,
): AngularRenderNode => {
  let Raw: ((props: SlotInputProps) => AngularRenderNode) | null = null;

  for (const plugin of slots[type] ?? []) {
    const { Component, tagName } = plugin;

    if (!Component) {
      continue;
    }

    const Previous = Raw;

    Raw = (input): AngularComponentNode => {
      const current = { ...input, Raw: Previous } as SlotProps[SlotType];

      return {
        kind: 'component',
        Component,
        props: current,
        tagName: typeof tagName === 'function' ? tagName(current as never) : tagName,
        children: 'children' in input ? input.children : undefined,
      };
    };
  }

  return Raw?.(props) ?? null;
};

export const resolveSlot = (node: AngularSlotNode, slots: Partial<Slots>): AngularRenderNode => {
  const content = composeSlot(node.type, node.props, slots);

  if (node.type === 'Wrapper' || node.type === 'Fallback' || !slots.Wrapper?.length) {
    return content;
  }

  return composeSlot('Wrapper', { type: node.type, props: node.props, children: content }, slots);
};

export const isSameNode = (previous: AngularRenderNode, current: AngularRenderNode) => {
  if (typeof previous !== 'object' || typeof current !== 'object' || !previous || !current) {
    return typeof previous === typeof current;
  }

  if (Array.isArray(previous) || Array.isArray(current) || previous.kind !== current.kind) {
    return false;
  }

  if (previous.kind === 'element' && current.kind === 'element') {
    return previous.tagName === current.tagName;
  }

  if (previous.kind === 'component' && current.kind === 'component') {
    return previous.Component === current.Component && previous.tagName === current.tagName;
  }

  if (previous.kind === 'template' && current.kind === 'template') {
    return previous.Template === current.Template;
  }

  return false;
};

export const getStyleValue = (name: string, value: unknown) => {
  if (
    typeof value === 'number' &&
    value !== 0 &&
    !name.startsWith('--') &&
    !UNITLESS_STYLES.includes(name)
  ) {
    return `${value}px`;
  }

  return String(value);
};

export const getHostProps = (props: unknown, tagName: string): Record<string, unknown> => {
  if (!props || typeof props !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(props).filter(([name]) => {
      return (
        HOST_ATTRIBUTES.includes(name) ||
        name.startsWith('data-') ||
        name.startsWith('aria-') ||
        (name === 'start' && tagName === 'OL') ||
        (name === 'type' && ['INPUT', 'BUTTON'].includes(tagName))
      );
    }),
  );
};
