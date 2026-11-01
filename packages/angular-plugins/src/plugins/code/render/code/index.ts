import type {
  AngularRenderMatchParams,
  AngularRenderParams,
} from '@fluxdown/angular-plugins/typings';

import {
  BaseAngularRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/angular-plugins/base';
import { assert } from '@fluxdown/utils';

import { getCode, getCodeElement, getCodeSuffix, getLanguage, getMeta } from './utils';

const CodeBlock = /*#__PURE__*/ createTypeOfSlot('CodeBlock');

export class CodeRenderPlugin extends BaseAngularRenderPlugin {
  static readonly key = 'render-code';

  match({ node }: AngularRenderMatchParams) {
    return isElementWithTag(node, 'pre');
  }

  render({ getProps, node, render, renderChildren }: AngularRenderParams) {
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
