import type { Element, ElementContent } from 'hast';

import { render } from '@testing-library/react';
import { Text, View } from 'react-native';

import { getNativeProps, renderNativeChildren } from '..';

const text = (value: string): ElementContent => ({ type: 'text', value });

const element = (tagName: string, children: ElementContent[] = []): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

describe('native HAST rendering', () => {
  test('keeps only native identifiers, accessibility and checkbox state', () => {
    const node = element('input');

    node.properties = {
      id: 'task',
      ariaLabel: 'Complete',
      checked: true,
      className: ['task-list-item'],
      style: 'display:none',
      onClick: 'unsafe()',
    };

    expect(getNativeProps(node)).toEqual({
      nativeID: 'task',
      accessibilityLabel: 'Complete',
      checked: true,
    });

    expect(getNativeProps()).toEqual({
      nativeID: undefined,
      accessibilityLabel: undefined,
      checked: false,
    });
  });

  test('groups tight-list inline runs and keeps nested blocks outside Text', () => {
    const nodes = [
      text('First '),
      element('strong', [text('strong')]),
      text(' tail'),
      element('p', [text('Block')]),
      text('Last'),
    ];

    const renderNode = (node: ElementContent) => {
      if (node.type === 'text') {
        return <Text>{node.value}</Text>;
      }

      if (node.type !== 'element') {
        return null;
      }

      const children = node.children.map((child) => (child.type === 'text' ? child.value : ''));

      return node.tagName === 'p' ? (
        <View testID="block">
          <Text>{children}</Text>
        </View>
      ) : (
        <Text>{children}</Text>
      );
    };

    const { container, getByTestId } = render(
      <View>{renderNativeChildren(nodes, renderNode)}</View>,
    );

    const groups = container.firstElementChild?.children;

    expect(groups).toHaveLength(3);

    expect(groups?.[0]).toHaveTextContent('First strong tail');

    expect(groups?.[1]).toBe(getByTestId('block'));

    expect(groups?.[2]).toHaveTextContent('Last');
  });

  test('does not add empty text containers between block children', () => {
    const nodes = [text('\n'), element('p'), text('\n'), element('ul'), text('\n')];

    const { container } = render(
      <View>
        {renderNativeChildren(nodes, () => (
          <View />
        ))}
      </View>,
    );

    expect(container.firstElementChild?.children).toHaveLength(2);
  });
});
