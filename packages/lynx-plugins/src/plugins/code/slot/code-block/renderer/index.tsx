import type { CodeBlockProps } from '../../../../../base';

import { createTypeOfSlot, joinClassNames, useBlockStyle, useTheme } from '../../../../../base';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const CodeHighlighter = /*#__PURE__*/ createTypeOfSlot('CodeHighlighter');

export const CodeBlockRenderer = ({
  Raw: _Raw,
  className,
  code,
  current,
  language,
  loading: _loading,
  meta,
  onCopy,
  parents,
  render: _render,
  showHeader = true,
  style,
  suffix,
  ...elementProps
}: CodeBlockProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  return (
    <view
      {...elementProps}
      className={joinClassNames('fluxdown-code', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '0px',
        ...blockStyle,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.lg,
        overflow: 'hidden',
        backgroundColor: tokens.colors.surfaceSubtle,
        ...style,
      }}
    >
      {showHeader ? (
        <CodeHeader code={code} language={language} meta={meta} onCopy={onCopy} />
      ) : null}
      <CodeHighlighter code={code} language={language} meta={meta} suffix={suffix} />
    </view>
  );
};
