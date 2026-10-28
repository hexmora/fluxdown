import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo, Show } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getCode, getCodeElement, getCodeSuffix, getLanguage, getMeta } from './utils';

const CodeBlock = /*#__PURE__*/ createTypeOfSlot('CodeBlock');

declare global {
  interface SolidRenderConfigs {
    'render-code': IPluggableConfig<void>;
  }
}

export class CodeRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-code';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'pre');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'pre'));

      return props.node;
    });

    const codeElement = createMemo(() => getCodeElement(node()));

    const suffix = createMemo(() => getCodeSuffix(node()));

    const attributes = () => {
      const { 'data-meta': _dataMeta, dataMeta: _camelDataMeta, ...rest } = props.getProps(node());

      return rest;
    };

    return (
      <CodeBlock
        {...attributes()}
        code={getCode(node(), codeElement())}
        language={getLanguage(node(), codeElement()) ?? 'plaintext'}
        meta={getMeta(node(), codeElement())}
        suffix={
          <Show when={suffix()}>
            {props.renderChildren(() => ({ ...(codeElement() ?? node()), children: [suffix()!] }))}
          </Show>
        }
      />
    );
  }
}
