import type { ScaleWordProps } from '../../../../../base';

import { AnimatedText, joinClassNames, useTextStyle } from '../../../../../base';

export type ScaleWordRendererProps = Omit<ScaleWordProps, 'Raw'> & { Raw?: ScaleWordProps['Raw'] };

export const ScaleWordRenderer = ({
  Raw: _Raw,
  children,
  class: className,
  style,
  ...elementProps
}: ScaleWordRendererProps) => {
  const textStyle = useTextStyle(style);

  return (
    <view
      {...elementProps}
      class={joinClassNames('fluxdown-scale-word', className)}
      style={{ ...textStyle, verticalAlign: 'baseline', overflow: 'visible' }}
    >
      <AnimatedText style={{ ...textStyle, whiteSpace: 'nowrap' }}>{children}</AnimatedText>
    </view>
  );
};

ScaleWordRenderer.inheritAttrs = false;
