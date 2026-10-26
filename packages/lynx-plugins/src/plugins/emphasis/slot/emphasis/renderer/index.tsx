import type { EmphasisProps } from '../../../../../base';

import { joinClassNames, TextStyleProvider, useTextStyle } from '../../../../../base';

export const EmphasisRenderer = ({
  Raw: _Raw,
  children,
  className,
  current: _current,
  parents: _parents,
  render: _render,
  style,
  ...elementProps
}: EmphasisProps) => {
  const textStyle = useTextStyle({ fontStyle: 'italic', ...style });

  return (
    <TextStyleProvider value={textStyle}>
      <text
        {...elementProps}
        className={joinClassNames('fluxdown-emphasis', className)}
        style={textStyle}
      >
        {children}
      </text>
    </TextStyleProvider>
  );
};
