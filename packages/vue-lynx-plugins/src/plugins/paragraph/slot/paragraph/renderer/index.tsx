import type { ParagraphProps } from '../../../../../base';

import { AnimatedText, joinClassNames, useBlockStyle, useTextStyle } from '../../../../../base';

export const ParagraphRenderer = ({
  Raw: _Raw,
  children,
  class: className,
  current,
  parents,
  render: _render,
  style,
  ...elementProps
}: ParagraphProps) => {
  const blockStyle = useBlockStyle(current, parents);

  const textStyle = useTextStyle();

  return (
    <AnimatedText
      {...elementProps}
      class={joinClassNames('fluxdown-paragraph', className)}
      style={{ ...textStyle, ...blockStyle, ...style }}
    >
      {children}
    </AnimatedText>
  );
};

ParagraphRenderer.inheritAttrs = false;
