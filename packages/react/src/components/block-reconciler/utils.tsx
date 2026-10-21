import type { IRenderPatchItem } from '@fluxdown/core';
import type { IReactRenderPlugin } from '@fluxdown/react-presets/base';
import type { Element, ElementContent, Parent, RootContent } from 'hast';
import type { ReactNode } from 'react';
import type { IReactiveState } from 'stative';

import {
  getReactProps,
  isHastElement,
  isHastParent,
  PATCH_MARKER,
} from '@fluxdown/react-presets/base';
import { PluginPriority } from '@fluxdown/types';
import { isObject, isString } from 'lodash-es';
import { Fragment } from 'react';

import type { RenderNodeParams } from './type';

const isElementContent = (node: RootContent): node is ElementContent =>
  node.type === 'comment' || node.type === 'element' || node.type === 'text';

const getChildKey = (node: RootContent, fallbackIndex: number) => {
  if (
    node.type === 'element' &&
    node.properties?.dataParserPatch === PATCH_MARKER &&
    isString(node.properties.dataPatchKey)
  ) {
    return `patch:${node.properties.dataPatchKey}`;
  }

  const tagName = node.type === 'element' ? `:${node.tagName}` : '';

  return `${fallbackIndex}:${node.type}${tagName}`;
};

export const renderParentChildren = (
  parent: Parent,
  parents: Parent[],
  patches: IReactiveState<IRenderPatchItem<ReactNode>[]>,
  plugins: IReactRenderPlugin[],
): ReactNode[] =>
  parent.children.map((child, index) => {
    if (!isElementContent(child)) {
      return null;
    }

    const node = renderNode({ node: child, parents, patches, plugins });

    if (isObject(node)) {
      return <Fragment key={getChildKey(child, index)}>{node}</Fragment>;
    }

    return node;
  });

const renderNode = ({ node, parents, patches, plugins }: RenderNodeParams): ReactNode => {
  const childParents = isHastParent(node) ? [...parents, node] : parents;

  const render = (child: ElementContent) =>
    renderNode({ node: child, parents: childParents, patches, plugins });

  const renderChildren = (target?: Parent) => {
    const parent = target ?? (isHastParent(node) ? node : null);

    if (!parent) {
      return null;
    }

    const nextParents = parent === node ? childParents : [...childParents, parent];

    return renderParentChildren(parent, nextParents, patches, plugins);
  };

  const getProps = (target?: Element) =>
    getReactProps(target ?? (isHastElement(node) ? node : undefined));

  let matched: IReactRenderPlugin | undefined;

  let priority = Infinity;

  for (const plugin of plugins) {
    const nextPriority = plugin.config.priority ?? PluginPriority.Default;

    if (nextPriority > priority || !plugin.match({ node, parents })) {
      continue;
    }

    matched = plugin;

    priority = nextPriority;
  }

  return (
    matched?.render({
      getProps,
      node,
      parents,
      patches,
      render,
      renderChildren,
    }) ?? null
  );
};
