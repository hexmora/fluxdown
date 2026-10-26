import type { BreakLineProps } from '../../../../../base';

import { useTextStyle } from '../../../../../base';

export const BreakLineRenderer = ({
  Raw: _Raw,
  className,
  style,
  ...elementProps
}: BreakLineProps) => (
  <text {...elementProps} className={className} style={useTextStyle(style)}>
    {'\n'}
  </text>
);
