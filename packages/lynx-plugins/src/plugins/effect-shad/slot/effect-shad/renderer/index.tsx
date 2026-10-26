import type { CSSProperties } from '@lynx-js/types';

import type { ShadProps } from '../../../../../base';

import { joinClassNames, TextStyleProvider, useTextStyle, useTheme } from '../../../../../base';
import './style.css';

export type ShadRendererProps = Omit<ShadProps, 'Raw'> & { Raw?: ShadProps['Raw'] };

export const ShadRenderer = ({
  Raw: _Raw,
  active,
  isActive,
  leading,
  maskWidth,
  className,
  style,
  ...elementProps
}: ShadRendererProps) => {
  const textStyle = useTextStyle(style);

  const { tokens } = useTheme();

  // Native Lynx text supports gradient colors; mask-image is restricted to views.
  const activeStyle: CSSProperties = {
    ...textStyle,
    color: `linear-gradient(to right, ${textStyle.color}, transparent)`,
  };

  return (
    <text
      {...elementProps}
      className={joinClassNames('fluxdown-shad', className)}
      style={textStyle}
    >
      <text style={textStyle}>{leading}</text>
      <TextStyleProvider value={activeStyle}>
        <text className="fluxdown-shad-active" style={activeStyle}>
          {active}
        </text>
      </TextStyleProvider>
      <view
        accessibility-elements-hidden={true}
        className="fluxdown-shad-mask"
        style={{
          width: `${maskWidth}px`,
          marginLeft: `${-maskWidth}px`,
          opacity: isActive ? 1 : 0,
          backgroundImage: `linear-gradient(to right, transparent, ${tokens.colors.bg})`,
        }}
      />
    </text>
  );
};
