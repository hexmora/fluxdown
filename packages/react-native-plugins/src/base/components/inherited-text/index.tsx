import type { ReactNode } from 'react';
import type { TextProps, TextStyle } from 'react-native';

import { useMemoValue } from '@fluxdown/react-hooks';
import { isEqual, pickBy } from 'lodash-es';
import { StyleSheet, Text } from 'react-native';

import { TextProvider, useTextStyle } from './hooks';

const TEXT_KEYS = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'fontVariant',
  'letterSpacing',
  'lineHeight',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textTransform',
  'writingDirection',
];

export type InheritedTextProps = Omit<TextProps, 'children'> & {
  children?: ReactNode | ((style: TextStyle) => ReactNode);
};

export const InheritedText = ({
  children,
  style,
  textBreakStrategy = 'simple',
  ...props
}: InheritedTextProps) => {
  const inherited = useTextStyle();

  const value = useMemoValue(
    {
      ...inherited,
      ...pickBy(
        StyleSheet.flatten(style),
        (item, key) => item !== undefined && TEXT_KEYS.includes(key),
      ),
    },
    isEqual,
  );

  return (
    <TextProvider value={value}>
      <Text {...props} style={style} textBreakStrategy={textBreakStrategy}>
        {typeof children === 'function' ? children(value) : children}
      </Text>
    </TextProvider>
  );
};
