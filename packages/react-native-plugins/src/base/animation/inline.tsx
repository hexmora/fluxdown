import type { ReactNode } from 'react';
import type { LayoutRectangle, TextStyle } from 'react-native';

import { useState } from 'react';
import { Text, View } from 'react-native';

import type { TextMeasurementValue } from './measurement';

import { InheritedText } from '../components';
import { TextMeasurement } from './measurement';

export type InlineDrawingProps = {
  children?: ReactNode;
  active: boolean;
  length?: number;
  onMeasure?: (layout: LayoutRectangle) => void;
  renderDrawing: (layout: LayoutRectangle, text: ReactNode, style: TextStyle) => ReactNode;
};

export const InlineDrawing = ({
  children,
  active,
  length = 1,
  renderDrawing,
  onMeasure,
}: InlineDrawingProps) => {
  const [layout, setLayout] = useState<TextMeasurementValue | null>(null);

  if (!active && !layout && !onMeasure) {
    return <InheritedText>{children}</InheritedText>;
  }

  return (
    <InheritedText>
      {(textStyle) => {
        return (
          <>
            <Text
              style={{
                ...textStyle,
                // Packed zero is treated as an unset foreground by native text spans.
                color: active ? 'rgba(255,255,255,0)' : textStyle.color,
                letterSpacing:
                  (textStyle.letterSpacing ?? 0) - (layout?.advance ?? 0) / Math.max(length, 1),
              }}
            >
              {children}
            </Text>
            {'\u2060'}
            <View
              style={{ width: 0, height: 0 }}
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              aria-hidden
            >
              {(active || onMeasure) && (
                <TextMeasurement
                  length={length}
                  style={textStyle}
                  onMeasure={(value) => {
                    setLayout(value);

                    onMeasure?.(value);
                  }}
                >
                  {children}
                </TextMeasurement>
              )}
              {active && layout && (
                <View
                  style={{
                    position: 'absolute',
                    left: -(layout.width - layout.advance),
                    bottom: layout.baseline - layout.height,
                    width: layout.width,
                    height: layout.height,
                  }}
                >
                  {renderDrawing(
                    layout,
                    <View style={{ flexDirection: 'row' }}>
                      <Text selectable={false} style={[textStyle, { flexShrink: 0 }]}>
                        {children}
                      </Text>
                    </View>,
                    textStyle,
                  )}
                </View>
              )}
            </View>
          </>
        );
      }}
    </InheritedText>
  );
};
