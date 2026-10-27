import { useMemo } from 'react';

import type { ScaleProps } from '../../../../../base';

import { InheritedText, InlineDrawing, useAppear } from '../../../../../base';
import { Drawing } from './components/drawing';
import { OPACITY, STEPS } from './consts';

const Glyph = ({ children, duration, from, start, blur }: ScaleProps) => {
  const { complete, progress } = useAppear(start, duration);

  const opacity = useMemo(
    () => progress.interpolate({ inputRange: STEPS, outputRange: OPACITY }),
    [progress],
  );

  return (
    <InlineDrawing
      active={!complete}
      renderDrawing={(layout, text, { fontSize = 16 }) => {
        return (
          <Drawing
            layout={layout}
            progress={progress}
            opacity={opacity}
            from={from}
            radius={blur * fontSize}
          >
            {text}
          </Drawing>
        );
      }}
    >
      {children}
    </InlineDrawing>
  );
};

export const ScaleRenderer = (props: ScaleProps) => {
  const { children } = props;

  if (typeof children !== 'string' && typeof children !== 'number') {
    return <InheritedText>{children}</InheritedText>;
  }

  return <Glyph {...props} />;
};
