import type { CodeHeaderAction } from '@fluxdown/vue-base-plugins/base';

import { defineComponent, h, isVNode, shallowRef } from 'vue';

import type { CodeHeaderProps } from '../../../../../base';

import { AnimatedText, joinClassNames, useTextStyle, useTheme } from '../../../../../base';

const renderAction = ({ key, target }: CodeHeaderAction) => {
  if (
    typeof target === 'function' ||
    (target && typeof target === 'object' && !isVNode(target) && !Array.isArray(target))
  ) {
    return <view key={key}>{h(target)}</view>;
  }

  return <view key={key}>{isVNode(target) ? target : <AnimatedText>{target}</AnimatedText>}</view>;
};

export const CodeHeaderRenderer = /*#__PURE__*/ defineComponent(
  (props: CodeHeaderProps, { attrs }) => {
    const copying = shallowRef(false);

    return () => {
      const {
        Raw: _Raw,
        actions,
        class: className,
        code,
        language,
        left,
        meta,
        onCopy,
        style,
        ...elementProps
      } = props;

      const { tokens } = useTheme();

      const textStyle = useTextStyle({
        color: tokens.colors.fgMuted,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.fontSize.xs,
        lineHeight: tokens.typography.lineHeight.sm,
      });

      const copy = async () => {
        if (!onCopy || copying.value) {
          return;
        }

        copying.value = true;

        try {
          await onCopy({ code, language, meta });
        } catch {
          // A rejected host clipboard request leaves the action available to retry.
        } finally {
          copying.value = false;
        }
      };

      const defaults: CodeHeaderAction[] = onCopy
        ? [
            {
              key: 'copy',
              target: (
                <AnimatedText
                  style={textStyle}
                  bindtap={() => {
                    void copy();
                  }}
                >
                  {copying.value ? 'Copying…' : 'Copy'}
                </AnimatedText>
              ),
            },
          ]
        : [];

      const resolved =
        typeof actions === 'function' ? actions(defaults) : [...defaults, ...(actions ?? [])];

      return (
        <view
          {...attrs}
          {...elementProps}
          class={joinClassNames('fluxdown-code-header', className)}
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
          <AnimatedText style={textStyle}>{left ?? language ?? 'text'}</AnimatedText>
          <view style={{ display: 'flex', flexDirection: 'row', gap: tokens.spacing.sm }}>
            {resolved.map(renderAction)}
          </view>
        </view>
      );
    };
  },
  {
    name: 'FluxdownCodeHeaderRenderer',
    props: ['Raw', 'actions', 'class', 'code', 'language', 'left', 'meta', 'onCopy', 'style'],
    inheritAttrs: false,
  },
);
