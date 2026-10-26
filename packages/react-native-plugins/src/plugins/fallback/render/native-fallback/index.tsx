import type { IPluggableConfig } from '@fluxdown/types';

import { getTextWords } from '@fluxdown/hast';
import { Text } from 'react-native';

import type { ReactRenderParams } from '../../../../base';

import {
  BaseReactRenderPlugin,
  BLOCK_TAG_NAMES,
  createTypeOfSlot,
  InlineRenderer,
  isHastElement,
  renderNativeChildren,
} from '../../../../base';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

declare global {
  interface RenderConfigs {
    'render-native-fallback': IPluggableConfig<void>;
  }
}

export class NativeFallbackRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-native-fallback';

  readonly config = { priority: Infinity };

  match() {
    return true;
  }

  render({ getProps, node, parents, render, renderChildren }: ReactRenderParams) {
    if (node.type === 'text') {
      const parent = parents[parents.length - 1];

      if (
        parent &&
        isHastElement(parent) &&
        parent.tagName === 'span' &&
        parent.properties.dataFluxdownScale === 'char'
      ) {
        // Scale already supplies its text host; keep the glyph input stable.
        return node.value;
      }

      const structural =
        parent?.type === 'root' ||
        (parent &&
          isHastElement(parent) &&
          ['blockquote', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'ul', 'ol'].includes(
            parent.tagName,
          ));

      if (structural && node.value.trim() === '') {
        return null;
      }

      const words: string[] = [];

      // Word boundaries keep line metrics stable when the shaded tail settles.
      // Include trailing whitespace to avoid a separate native text fragment.
      for (const word of getTextWords(node.value, { mergeCjk: true })) {
        if (words.length > 0 && /^\s+$/.test(word)) {
          words[words.length - 1] += word;
        } else {
          words.push(word);
        }
      }

      const children = words.map((word, index) =>
        /^\s+$/.test(word) ? word : <Text key={index}>{word}</Text>,
      );

      return parent?.type === 'root' ? (
        <InlineRenderer>{children}</InlineRenderer>
      ) : (
        <Text>{children}</Text>
      );
    }

    if (node.type !== 'element') {
      return null;
    }

    const children = BLOCK_TAG_NAMES.includes(node.tagName)
      ? renderNativeChildren(node.children, render)
      : renderChildren(node);

    return (
      <Element {...getProps(node)} tagName={node.tagName}>
        {children}
      </Element>
    );
  }
}
