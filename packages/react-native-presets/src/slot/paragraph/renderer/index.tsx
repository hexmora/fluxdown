import type { Element } from 'hast';

import { findLast } from 'lodash-es';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

import type { ParagraphProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';
import { isBlockNode, renderBlocks } from '../../utils/blocks';

export const ParagraphRenderer = (props: ParagraphProps) => {
  const { children, style, nativeID, testID, accessibilityLabel } = {
    ...getReactNativeProps(props.current),
    ...props,
  };

  const { colors, styles, selectable } = useNativeTheme();

  const parent = props.parents?.at(-1);

  const parentTag = parent?.type === 'element' ? (parent as Element).tagName : undefined;

  const last = findLast(parent?.children, (child) => child.type === 'element') === props.current;

  const inList = parentTag === 'li';

  const textStyle = [
    {
      color: parentTag === 'blockquote' ? colors.muted : colors.text,
      fontSize: 16,
      lineHeight: 26.4,
      marginTop: inList ? 8 : 0,
      marginBottom: inList ? 8 : parentTag === 'blockquote' && last ? 0 : 16,
    },
    styles.text,
    styles.paragraph,
    style,
  ];

  if (props.current?.type === 'element' && props.current.children.some(isBlockNode)) {
    return (
      <View nativeID={nativeID} testID={testID} accessibilityLabel={accessibilityLabel}>
        {renderBlocks(props.current.children, props.render, (nodes) => (
          <Text selectable={selectable} style={textStyle}>
            {nodes.map((node, index) => (
              <Fragment key={index}>{props.render(node)}</Fragment>
            ))}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      selectable={selectable}
      nativeID={nativeID}
      testID={testID}
      style={textStyle}
    >
      {children}
    </Text>
  );
};
