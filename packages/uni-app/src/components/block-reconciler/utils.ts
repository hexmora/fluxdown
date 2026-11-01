import type { IRenderPatchItem } from '@fluxdown/core';
import type { IUniRenderPlugin, UniRenderNode } from '@fluxdown/uni-app-plugins/base';
import type { GetPropsFunction } from '@fluxdown/uni-app-plugins/typings';
import type { Element, ElementContent, Parent, RootContent } from 'hast';
import type { IReactiveState } from 'stative';

import { PluginPriority } from '@fluxdown/types';
import { isHastElement, isHastParent } from '@fluxdown/uni-app-plugins/base';
import { isArray, isObject, isString } from 'lodash-es';

import type { RenderNodeParams } from './type';

import { BLOCK_CONTAINERS } from './consts';

const isElementContent = (node: RootContent): node is ElementContent =>
  node.type === 'comment' || node.type === 'element' || node.type === 'text';

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

  return `${fallbackIndex}:${node.type}${tagName}`;
};

export const renderParentChildren = (
  parent: Parent,
  parents: Parent[],
  patches: IReactiveState<IRenderPatchItem<UniRenderNode>[]>,
  plugins: IUniRenderPlugin[],
  getProps: GetPropsFunction | undefined | null,
): UniRenderNode[] =>
  parent.children.map((child, index) => {
    if (
      !isElementContent(child) ||
      (child.type === 'text' &&
        !child.value.trim() &&
        (parent.type === 'root' ||
          (isHastElement(parent) && BLOCK_CONTAINERS.includes(parent.tagName))))
    ) {
      return null;
    }

    const node = renderNode({ node: child, parents, patches, plugins, getProps });

    if (isObject(node) && !isArray(node)) {
      return { ...node, key: getChildKey(child, index) };
    }

    return node;
  });

const renderNode = ({
  node,
  parents,
  patches,
  plugins,
  getProps: getNodeProps,
}: RenderNodeParams): UniRenderNode => {
  const childParents = isHastParent(node) ? [...parents, node] : parents;

  const render = (child: ElementContent) =>
    renderNode({ node: child, parents: childParents, patches, plugins, getProps: getNodeProps });

  const renderChildren = (target?: Parent) => {
    const parent = target ?? (isHastParent(node) ? node : null);

    if (!parent) {
      return [];
    }

    const nextParents = parent === node ? childParents : [...childParents, parent];

    return renderParentChildren(parent, nextParents, patches, plugins, getNodeProps);
  };

  const getProps = (target?: Element) => {
    if (getNodeProps === null) {
      return {};
    }

    const current = target ?? (isHastElement(node) ? node : undefined);

    return getNodeProps ? getNodeProps(current) : { ...current?.properties };
  };

  let matched: IUniRenderPlugin | undefined;

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
