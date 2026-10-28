import type { ISolidRenderPlugin, SolidRenderParams } from '@fluxdown/solid-plugins/base';
import type { Element, ElementContent, Parent, RootContent } from 'hast';
import type { Accessor, Component } from 'solid-js';

import { isHastElement, isHastParent } from '@fluxdown/solid-plugins/base';
import { PluginPriority } from '@fluxdown/types';
import { isString } from 'lodash-es';
import { createMemo, For, mergeProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { RenderChildrenParams, RenderNodeParams } from './type';

const isElementContent = (node: RootContent): node is ElementContent => {
  return node.type === 'comment' || node.type === 'element' || node.type === 'text';
};

const getChildKey = (node: RootContent, fallbackIndex: number) => {
  if (
    node.type === 'element' &&
    node.properties?.dataParserPatch === '1' &&
    isString(node.properties.dataPatchKey)
  ) {
    return `patch:${node.properties.dataPatchKey}`;
  }

  if (isString(node.data?.renderKey)) {
    return `render:${node.data.renderKey}`;
  }

  const tagName = node.type === 'element' ? `:${node.tagName}` : '';

  // Source positions stay stable when effect wrappers settle into text.
  if (node.position?.start.offset !== undefined) {
    return `source:${node.position.start.offset}:${node.type}${tagName}`;
  }

  return `${fallbackIndex}:${node.type}${tagName}`;
};

export const ChildrenReconciler = (props: RenderChildrenParams) => {
  const nodes = createMemo(() => {
    const children = props.node?.children ?? [];

    const result = new Map<string, ElementContent>();

    children.forEach((child, index) => {
      if (!isElementContent(child)) {
        return;
      }

      const previous = children[index - 1];

      const key =
        child.type === 'text'
          ? `text:${previous ? getChildKey(previous, index - 1) : 'start'}`
          : getChildKey(child, index);

      result.set(result.has(key) ? `fallback:${index}` : key, child);
    });

    return result;
  });

  const keys = createMemo(() => [...nodes().keys()]);

  return (
    <For each={keys()}>
      {(key) => {
        return <NodeReconciler {...props} node={nodes().get(key)} />;
      }}
    </For>
  );
};

const NodeReconciler = (props: RenderNodeParams) => {
  const childParents = createMemo(() => {
    const node = props.node;

    return node && isHastParent(node) ? [...props.parents, node] : props.parents;
  });

  const render = (node: ElementContent | Accessor<ElementContent>) => {
    return (
      <NodeReconciler
        {...props}
        node={typeof node === 'function' ? node() : node}
        parents={childParents()}
      />
    );
  };

  const renderChildren = (target?: Parent | Accessor<Parent>) => {
    const current = target === undefined || target === props.node;

    const node = () => {
      const value = current ? props.node : typeof target === 'function' ? target() : target;

      return value && isHastParent(value) ? value : undefined;
    };

    const parents = () => {
      const value = node();

      return current || !value ? childParents() : [...childParents(), value];
    };

    return <ChildrenReconciler {...props} node={node()} parents={parents()} />;
  };

  const getProps = (target?: Element) => {
    if (props.getProps === null) {
      return {};
    }

    const node = props.node;

    const current = target ?? (node && isHastElement(node) ? node : undefined);

    return props.getProps ? props.getProps(current) : { ...current?.properties };
  };

  const matched = createMemo(() => {
    const node = props.node;

    if (!node) {
      return undefined;
    }

    let result: ISolidRenderPlugin | undefined;

    let priority = Infinity;

    for (const plugin of props.plugins) {
      const nextPriority = plugin.config.priority ?? PluginPriority.Default;

      if (nextPriority > priority || !plugin.match({ node, parents: props.parents })) {
        continue;
      }

      result = plugin;

      priority = nextPriority;
    }

    return result;
  });

  const Renderer = createMemo<Component<SolidRenderParams> | undefined>(() => {
    const plugin = matched();

    return plugin?.render.bind(plugin);
  });

  const params = mergeProps(props, { getProps, render, renderChildren });

  return <Dynamic component={Renderer()} {...params} node={props.node!} />;
};
