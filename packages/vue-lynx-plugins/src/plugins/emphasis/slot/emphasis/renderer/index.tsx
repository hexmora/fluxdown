import type { EmphasisProps } from '../../../../../base';

import { AnimatedText, joinClassNames, TextStyleProvider, useTextStyle } from '../../../../../base';

export const EmphasisRenderer = ({
  Raw: _Raw,
  children,
  class: className,
  current: _current,
  parents: _parents,
  render: _render,
  style,
  ...elementProps
}: EmphasisProps) => {
  const textStyle = useTextStyle({ fontStyle: 'italic', ...style });

  return (
    <TextStyleProvider value={textStyle}>
      <AnimatedText
        {...elementProps}
        class={joinClassNames('fluxdown-emphasis', className)}
        style={textStyle}
      >
        {children}
      </AnimatedText>
    </TextStyleProvider>
  );
};

EmphasisRenderer.inheritAttrs = false;
