import type { ScaleWordProps } from '../../../../../base';

import { AnimatedText, joinClassNames, useTextStyle } from '../../../../../base';

export type ScaleWordRendererProps = Omit<ScaleWordProps, 'Raw'> & { Raw?: ScaleWordProps['Raw'] };

export const ScaleWordRenderer = ({
  Raw: _Raw,
  children,
  className,
  style,
  ...elementProps
}: ScaleWordRendererProps) => {
  const textStyle = useTextStyle(style);

  return (
    <view
      {...elementProps}
      className={joinClassNames('fluxdown-scale-word', className)}
      style={{ ...textStyle, verticalAlign: 'baseline', overflow: 'visible' }}
    >
      <AnimatedText style={{ ...textStyle, whiteSpace: 'nowrap' }}>{children}</AnimatedText>
    </view>
  );
};
