import type { ParagraphProps } from '../../../../../base';

import { joinClassNames, useBlockStyle, useTextStyle } from '../../../../../base';

export const ParagraphRenderer = ({
  Raw: _Raw,
  children,
  className,
  current,
  parents,
  render: _render,
  style,
  ...elementProps
}: ParagraphProps) => {
  const blockStyle = useBlockStyle(current, parents);

  const textStyle = useTextStyle();

  return (
    <text
      {...elementProps}
      className={joinClassNames('fluxdown-paragraph', className)}
      style={{ ...textStyle, ...blockStyle, ...style }}
    >
      {children}
    </text>
  );
};
