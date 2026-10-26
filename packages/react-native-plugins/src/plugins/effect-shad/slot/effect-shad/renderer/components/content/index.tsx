import type { ColorValue } from 'react-native';

import { getTextUnits } from '@fluxdown/hast';
import { useLatestFn } from '@fluxdown/react-hooks';
import { pick } from 'lodash-es';
import { useId, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, ForeignObject, G, LinearGradient, Mask, Rect, Stop } from 'react-native-svg';

import type { ShadProps } from '../../../../../../../base';
import type { ShadToken, TokenMeasurement } from '../../utils';

import { InheritedText, InlineDrawing } from '../../../../../../../base';
import { getGradient, getShadTokens, sliceText } from '../../utils';

type TokenProps = {
  token: ShadToken;
  gradient: { start: number; width: number } | null;
  color: ColorValue;
  onMeasure: (value: TokenMeasurement) => void;
};

const Token = ({ token, gradient, color, onMeasure }: TokenProps) => {
  const id = useId();

  if (/^\s+$/.test(token.text)) {
    return (
      <InlineDrawing
        active={false}
        length={[...getTextUnits(token.text)].length}
        onMeasure={({ width }) => onMeasure({ width })}
        renderDrawing={() => null}
      >
        {token.children}
      </InlineDrawing>
    );
  }

  return (
    <InlineDrawing
      active
      length={[...getTextUnits(token.text)].length}
      onMeasure={({ width }) => onMeasure({ width })}
      renderDrawing={({ width: measured, height }, text, style) => {
        // Drawing may need the fractional pixel omitted by a layout measurement.
        const drawingWidth = measured + 1;

        const drawingHeight = height + 1;

        return (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, top: 0, width: measured, height }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
          >
            <Text
              selectable={false}
              style={[style, { position: 'absolute', opacity: 0 }]}
              onLayout={({ nativeEvent }) => onMeasure({ prefix: nativeEvent.layout.width })}
            >
              {token.prefixText.length > 0 ? token.prefix : '\u2060'}
            </Text>
            {gradient && (
              <Svg width={drawingWidth} height={drawingHeight} pointerEvents="none">
                <Defs>
                  <LinearGradient
                    id={`${id}-gradient`}
                    gradientUnits="userSpaceOnUse"
                    x1={gradient.start}
                    x2={gradient.start + gradient.width}
                    y1={0}
                    y2={0}
                  >
                    <Stop offset="0" stopColor="white" />
                    <Stop offset="1" stopColor="white" stopOpacity="0" />
                  </LinearGradient>
                  <Mask
                    id={id}
                    maskType="alpha"
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={drawingWidth}
                    height={drawingHeight}
                  >
                    <Rect
                      width={drawingWidth}
                      height={drawingHeight}
                      fill={`url(#${id}-gradient)`}
                    />
                  </Mask>
                </Defs>
                <G mask={`url(#${id})`}>
                  <ForeignObject width={drawingWidth} height={drawingHeight}>
                    {text}
                  </ForeignObject>
                </G>
              </Svg>
            )}
          </View>
        );
      }}
    >
      {!gradient && token.prefixText.length > 0 ? (
        <>
          <Text style={{ color }}>{token.prefix}</Text>
          {sliceText(token.children, token.prefixText.length, token.text.length)}
        </>
      ) : (
        token.children
      )}
    </InlineDrawing>
  );
};

export const ShadContent = ({
  leading,
  active,
  offset = 0,
}: Pick<ShadProps, 'leading' | 'active' | 'offset'>) => {
  const content = useMemo(() => getShadTokens(leading, active, offset), [active, leading, offset]);

  const [measurements, setMeasurements] = useState<Record<string, TokenMeasurement>>({});

  const onMeasure = useLatestFn((key: string, value: TokenMeasurement) => {
    const keys = content.tokens.map((token) => token.key);

    if (!keys.includes(key)) {
      return;
    }

    setMeasurements((previous) => {
      const next = pick(previous, keys);

      const current = next[key];

      const measurement = { ...current, ...value };

      if (
        current?.width === measurement.width &&
        current?.prefix === measurement.prefix &&
        Object.keys(next).length === Object.keys(previous).length
      ) {
        return previous;
      }

      return { ...next, [key]: measurement };
    });
  });

  return (
    <InheritedText>
      {({ color = 'black' }) => {
        return (
          <>
            {content.leading}
            {content.tokens.map((token) => (
              <Token
                key={token.key}
                token={token}
                color={color}
                gradient={getGradient(content.tokens, measurements, token.key)}
                onMeasure={(value) => onMeasure(token.key, value)}
              />
            ))}
          </>
        );
      }}
    </InheritedText>
  );
};
