import type { TexProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  useBlockStyle,
  useTextStyle,
  useTheme,
} from '../../../../../base';

/** TeX source is preserved until an application supplies a native math slot. */
export const TexRenderer = ({
  Raw: _Raw,
  className,
  current,
  mode = 'inline',
  parents,
  render: _render,
  style,
  tex,
  ...elementProps
}: TexProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  const textStyle = useTextStyle({
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.code.fontSize,
  });

  return (
    <AnimatedText
      {...elementProps}
      className={joinClassNames('fluxdown-tex', className)}
      style={{
        ...textStyle,
        ...(mode === 'display' ? { ...blockStyle, textAlign: 'center' } : {}),
        ...style,
      }}
    >
      {tex}
    </AnimatedText>
  );
};
