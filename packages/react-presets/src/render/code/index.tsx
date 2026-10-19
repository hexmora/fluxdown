import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../base';

import { BaseReactRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../base';
import { getCode, getCodeElement, getCodeSuffix, getLanguage, getMeta } from './utils';

const CodeBlock = /*#__PURE__*/ createTypeOfSlot('CodeBlock');

declare global {
  interface RenderConfigs {
    'render-code': IPluggableConfig<void>;
  }
}

export class CodeRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-code';

  match({ node }: ReactRenderMatchParams) {
    return isElementWithTag(node, 'pre');
  }

  render({ getProps, node, render, renderChildren }: ReactRenderParams) {
    assert(isElementWithTag(node, 'pre'));

    const codeElement = getCodeElement(node);

    const suffix = getCodeSuffix(node);

    const { 'data-meta': _dataMeta, dataMeta: _camelDataMeta, ...props } = getProps(node);

    return (
      <CodeBlock
        {...props}
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
  }
}
