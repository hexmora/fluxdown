import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';

import type { UniRenderMatchParams, UniRenderParams } from '../../../../base';

import { BaseUniRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getCode, getCodeElement, getCodeSuffix, getLanguage, getMeta } from './utils';

const CodeBlock = /*#__PURE__*/ createTypeOfSlot('CodeBlock');

declare global {
  interface UniRenderConfigs {
    'render-code': IPluggableConfig<void>;
  }
}

export class CodeRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-code';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'pre');
  }

  render({ getProps, node, render, renderChildren }: UniRenderParams) {
    assert(isElementWithTag(node, 'pre'));

    const codeElement = getCodeElement(node);

    const suffix = getCodeSuffix(node);

    const { 'data-meta': _dataMeta, dataMeta: _camelDataMeta, ...props } = getProps(node);

    return CodeBlock({
      ...props,
      code: getCode(node, codeElement),
      language: getLanguage(node, codeElement) ?? 'plaintext',
      meta: getMeta(node, codeElement),
      suffix: suffix
        ? codeElement
          ? renderChildren({ ...codeElement, children: [suffix] })
          : render(suffix)
        : undefined,
    });
  }
}
