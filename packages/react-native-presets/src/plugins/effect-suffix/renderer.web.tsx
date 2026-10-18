import type { TextStyle } from 'react-native';

import { StyleSheet, Text } from 'react-native';

import type { SuffixRendererProps } from './type';

import { useReducedMotion } from '../effects/use-reduced-motion';

export * from './type';

const styles = StyleSheet.create({
  root: {
    display: 'inline-block',
    position: 'relative',
    width: 0,
    height: '1lh',
    verticalAlign: 'top',
    pointerEvents: 'none',
    userSelect: 'none',
  } as unknown as TextStyle,
  marker: {
    position: 'absolute',
    insetInlineStart: '0.18em',
    top: '50%',
    transform: 'translateY(-50%)',
  } as unknown as TextStyle,
  breathe: {
    animationDuration: '1s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationKeyframes: { '0%,33.333333%,100%': { opacity: 1 }, '50%,83.333333%': { opacity: 0 } },
  } as TextStyle,
  cursor: {
    width: 'calc(1lh * 0.39 / 1.65)',
    height: '1em',
    borderRadius: '0.06em',
    backgroundColor: 'currentColor',
  } as unknown as TextStyle,
  dot: {
    width: '0.624em',
    height: '0.624em',
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  } as unknown as TextStyle,
  custom: {
    top: 0,
    transform: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '1lh',
  } as unknown as TextStyle,
});

export const SuffixRenderer = ({ children, type }: SuffixRendererProps) => {
  const reduced = useReducedMotion();
  return (
    <Text aria-hidden={true} {...{ dataSet: { fluxdownSuffix: type } }} style={styles.root}>
      <Text
        style={[
          styles.marker,
          !reduced && styles.breathe,
          type === 'cursor' ? styles.cursor : type === 'dot' ? styles.dot : styles.custom,
        ]}
      >
        {children}
      </Text>
    </Text>
  );
};
