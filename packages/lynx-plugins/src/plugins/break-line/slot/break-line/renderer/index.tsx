import type { BreakLineProps } from '../../../../../base';

import { AnimatedText, useTextStyle } from '../../../../../base';

export const BreakLineRenderer = ({
  Raw: _Raw,
  className,
  style,
  ...elementProps
}: BreakLineProps) => (
  <AnimatedText {...elementProps} className={className} style={useTextStyle(style)}>
    {'\n'}
  </AnimatedText>
);
