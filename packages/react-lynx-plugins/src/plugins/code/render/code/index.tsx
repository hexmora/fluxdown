import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactLynxRenderMatchParams, ReactLynxRenderParams } from '../../../../base';

import { BaseReactLynxRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getCode, getCodeElement, getCodeSuffix, getLanguage, getMeta } from './utils';

const CodeBlock = /*#__PURE__*/ createTypeOfSlot('CodeBlock');

declare global {
  interface ReactLynxRenderConfigs {
    'render-code': IPluggableConfig<void>;
  }
}

const renderNode = ({ getProps, node, parents, render, renderChildren }: ReactLynxRenderParams) => {
  assert(isElementWithTag(node, 'pre'));

  const codeElement = getCodeElement(node);

  const suffix = getCodeSuffix(node);

  const { 'data-meta': _dataMeta, dataMeta: _camelDataMeta, ...props } = getProps(node);

  return (
    <CodeBlock
      {...props}
      current={node}
      parents={parents}
      render={render}
      code={getCode(node, codeElement)}
      language={getLanguage(node, codeElement) ?? 'plaintext'}
      meta={getMeta(node, codeElement)}
      suffix={
        suffix
          ? codeElement
            ? renderChildren({ ...codeElement, children: [suffix] })
            : render(suffix)
          : undefined
      }
    />
  );
};

export class CodeRenderPlugin extends BaseReactLynxRenderPlugin {
  static readonly key = 'render-code';

  match({ node }: ReactLynxRenderMatchParams) {
    return isElementWithTag(node, 'pre');
  }

  readonly render = renderNode;
}
