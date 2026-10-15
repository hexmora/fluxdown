import type { IRehypePlugin } from '@fluxdown/types';

import { BaseRehypePlugin, SanitizerRehypePlugin } from '@fluxdown/core-presets/rehype';
import { SyntaxHtmlAllowedRemarkPlugin } from '@fluxdown/core-presets/remark';
import { render } from '@testing-library/react-native';

import { Fluxdown } from '..';
import { expectNativeTextContainers, textContent } from './utils/native';

type NativeNode = Exclude<ReturnType<ReturnType<typeof render>['toJSON']>, null>;

const expectBlockLayout = (node: NativeNode, insideText = false): void => {
  if (Array.isArray(node)) {
    node.forEach((child) => expectBlockLayout(child, insideText));

    return;
  }

  if (insideText) {
    expect(node.type).not.toMatch(/View|Image/);
  }

  for (const child of node.children ?? []) {
    if (typeof child !== 'string') {
      expectBlockLayout(child, insideText || /Text/.test(node.type));
    }
  }
};

describe('native block layout', () => {
  test('keeps paragraph images outside text layout without losing surrounding text', () => {
    const view = render(
      <Fluxdown text="before ![illustration](https://example.com/image.png) after" />,
    );

    const tree = view.toJSON();

    expect(textContent(tree)).toContain('before');

    expect(textContent(tree)).toContain('after');

    expect(view.getByLabelText('illustration')).toBeTruthy();

    expectBlockLayout(tree!);
  });

  test.each([
    '<div>alpha <em>beta</em><ul><li>list</li></ul></div>',
    '<custom-block><nested-block><ul><li>list</li></ul></nested-block></custom-block>',
    '<table><tbody><tr><td><ul><li>list</li></ul></td></tr></tbody></table>',
  ])('keeps block content in native layout containers: %s', (text) => {
    const view = render(
      <Fluxdown
        text={text}
        plugins={[
          {
            remarks: [[SyntaxHtmlAllowedRemarkPlugin, { enabledTags: true }]],
            rehypes: [[SanitizerRehypePlugin, { allowedTags: ['custom-block', 'nested-block'] }]],
          },
        ]}
      />,
    );

    const tree = view.toJSON();

    expect(textContent(tree)).toContain('list');

    expect(textContent(tree)).not.toContain('<');

    expect(tree).not.toBeNull();

    expectNativeTextContainers(tree);

    expectBlockLayout(tree!);
  });

  test('keeps blocks inside custom plugin elements in native layout containers', () => {
    class CustomBlock extends BaseRehypePlugin {
      static readonly key = 'native-custom-block-layout';

      readonly config = { priority: Infinity };

      plugin: IRehypePlugin['plugin'] = () => (tree) => {
        tree.children = [
          {
            type: 'element',
            tagName: 'custom-block',
            properties: {},
            children: [
              {
                type: 'element',
                tagName: 'nested-block',
                properties: {},
                children: tree.children.filter((child) => child.type !== 'doctype'),
              },
            ],
          },
        ];
      };
    }

    const view = render(<Fluxdown text="- list" plugins={[{ rehypes: [CustomBlock] }]} />);

    const tree = view.toJSON();

    expect(textContent(tree)).toContain('list');

    expectBlockLayout(tree!);
  });
});
