import type { BreakLineProps } from '../../../../../base';

import { AnimatedText, useTextStyle } from '../../../../../base';

export const BreakLineRenderer = ({
  Raw: _Raw,
  class: className,
  style,
  ...elementProps
}: BreakLineProps) => (
  <AnimatedText {...elementProps} class={className} style={useTextStyle(style)}>
    {'\n'}
  </AnimatedText>
);

BreakLineRenderer.inheritAttrs = false;
