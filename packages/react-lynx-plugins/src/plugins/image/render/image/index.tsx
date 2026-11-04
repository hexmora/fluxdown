import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { isString } from 'lodash-es';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Image = /*#__PURE__*/ createTypeOfSlot('Image');

declare global {
  interface ReactLynxRenderConfigs {
    'render-image': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render }: ReactLynxRenderParams) => {
  assert(isElementWithTag(node, 'img'));

  const src = node.properties?.src;

  if (!isString(src) || !src.trim()) {
    return null;
  }

  const { alt: _alt, src: _src, title: _title, ...props } = getProps(node);

  const alt = isString(node.properties?.alt) ? node.properties.alt : '';

  const title = isString(node.properties?.title) ? node.properties.title : undefined;

  return (
    <Image
      {...props}
      alt={alt}
      current={node}
      parents={parents}
      render={render}
      src={src}
      title={title}
    />
  );
};

export class ImageRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-image';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'img');
  }

  readonly render = renderNode;
}
