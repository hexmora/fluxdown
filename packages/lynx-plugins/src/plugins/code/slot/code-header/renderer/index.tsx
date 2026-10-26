import { createElement, isValidElement, useRef, useState } from '@lynx-js/react';

import type { CodeHeaderAction, CodeHeaderProps } from '../../../../../base';

import { joinClassNames, useTextStyle, useTheme } from '../../../../../base';

const renderAction = ({ key, target }: CodeHeaderAction) => {
  if (typeof target === 'function') {
    return <view key={key}>{createElement(target)}</view>;
  }

  return <view key={key}>{isValidElement(target) ? target : <text>{target}</text>}</view>;
};

export const CodeHeaderRenderer = ({
  Raw: _Raw,
  actions,
  className,
  code,
  language,
  left,
  meta,
  onCopy,
  style,
  ...elementProps
}: CodeHeaderProps) => {
  const { tokens } = useTheme();

  const [copying, setCopying] = useState(false);

  const pending = useRef(false);

  const textStyle = useTextStyle({
    color: tokens.colors.fgMuted,
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.typography.fontSize.xs,
    lineHeight: tokens.typography.lineHeight.sm,
  });

  const copy = async () => {
    if (!onCopy || pending.current) {
      return;
    }

    pending.current = true;

    setCopying(true);

    try {
      await onCopy({ code, language, meta });
    } catch {
      // A rejected host clipboard request leaves the action available to retry.
    } finally {
      pending.current = false;

      setCopying(false);
    }
  };

  const defaults: CodeHeaderAction[] = onCopy
    ? [
        {
          key: 'copy',
          target: (
            <text
              style={textStyle}
              bindtap={() => {
                void copy();
              }}
            >
              {copying ? 'Copying…' : 'Copy'}
            </text>
          ),
        },
      ]
    : [];

  const resolved =
    typeof actions === 'function' ? actions(defaults) : [...defaults, ...(actions ?? [])];

  return (
    <view
      {...elementProps}
      className={joinClassNames('fluxdown-code-header', className)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '44px',
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        borderBottom: `1px solid ${tokens.colors.border}`,
        backgroundColor: tokens.colors.surfaceMuted,
        ...style,
      }}
    >
      <text style={textStyle}>{left ?? language ?? 'text'}</text>
      <view style={{ display: 'flex', flexDirection: 'row', gap: tokens.spacing.sm }}>
        {resolved.map(renderAction)}
      </view>
    </view>
  );
};
