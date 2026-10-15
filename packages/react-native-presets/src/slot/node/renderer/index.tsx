import type { Element, Parent } from 'hast';
import type { TextProps, ViewProps } from 'react-native';

import { isSafeTagName } from '@fluxdown/react-base-presets/base';
import { Platform, Text, View } from 'react-native';

import type { NodeProps } from '../../../base';

import { getReactNativeProps, useNativeTheme } from '../../../base';
import { isBlockNode, renderBlocks } from '../../utils/blocks';

const INLINE_PARENTS = new Set([
  'p',
  'a',
  'span',
  'strong',
  'em',
  'code',
  'del',
  's',
  'u',
  'sub',
  'sup',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);

const findCheckbox = (node: Element): Element | undefined => {
  for (const child of node.children) {
    if (child.type !== 'element') {
      continue;
    }

    if (child.tagName === 'input' && child.properties.type === 'checkbox') {
      return child;
    }

    if (child.tagName === 'p') {
      const checkbox = findCheckbox(child);

      if (checkbox) {
        return checkbox;
      }
    }
  }

  return undefined;
};

const ListItem = ({
  node,
  parents,
  render,
  renderChildren,
  style,
  ...props
}: {
  node: Element;

  parents: Parent[];

  render: NodeProps['render'];

  renderChildren: NodeProps['renderChildren'];
} & ViewProps) => {
  const { colors, styles, selectable } = useNativeTheme();

  const parent = parents[parents.length - 1];

  const ordered = parent?.type === 'element' && (parent as Element).tagName === 'ol';

  const siblings =
    parent?.children.filter((child) => child.type === 'element' && child.tagName === 'li') ?? [];

  const start = ordered ? Number((parent as Element).properties.start ?? 1) : 1;

  const checkbox = findCheckbox(node);

  const checked = Boolean(checkbox?.properties.checked);

  const loose = node.children.some((child) => child.type === 'element' && child.tagName === 'p');

  const marker = checkbox
    ? checked
      ? '☑'
      : '☐'
    : ordered
      ? `${(Number.isFinite(start) ? start : 1) + siblings.indexOf(node)}.`
      : '•';

  return (
    <View
      {...props}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: siblings.at(-1) === node ? 0 : 4,
        },
        styles.listItem,
        style,
      ]}
    >
      <Text
        selectable={selectable}
        accessibilityRole={checkbox ? 'checkbox' : undefined}
        accessibilityState={checkbox ? { checked, disabled: true } : undefined}
        style={[
          {
            color: colors.muted,
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 26.4,
            minWidth: 28,
            paddingRight: 8,
            marginTop: loose ? 8 : 0,
          },
          styles.text,
          styles.listMarker,
        ]}
      >
        {marker}
      </Text>
      <View style={{ flex: 1, minWidth: 0 }}>
        {renderBlocks(node.children, render, (children) => {
          const last = children.at(-1);

          const inline: Element = {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: children.map((child) =>
              child === last && child.type === 'text'
                ? { ...child, value: child.value.replace(/\r?\n$/, '') }
                : child,
            ),
          };

          return (
            <Text
              selectable={selectable}
              style={[{ color: colors.text, fontSize: 16, lineHeight: 26.4 }, styles.text]}
            >
              {renderChildren(inline)}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const InlineCode = ({ children, style, ...props }: TextProps) => {
  const { colors, styles } = useNativeTheme();

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          backgroundColor: colors.surfaceMuted,
          fontSize: 14,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 4,
          paddingHorizontal: 4.9,
          paddingVertical: 2.1,
        },
        styles.inlineCode,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const DeletedText = ({ style, ...props }: TextProps) => {
  const { colors } = useNativeTheme();

  return (
    <Text {...props} style={[{ color: colors.muted, textDecorationLine: 'line-through' }, style]} />
  );
};

const Rule = ({ style, ...props }: ViewProps) => {
  const { colors, styles } = useNativeTheme();

  return (
    <View
      {...props}
      style={[
        { height: 1, backgroundColor: colors.border, marginVertical: 24 },
        styles.breakLine,
        style,
      ]}
    />
  );
};

const TableRow = ({
  node,
  parents,
  children,
  style,
  ...props
}: ViewProps & {
  node: Element;

  parents: Parent[];
}) => {
  const { colors, styles } = useNativeTheme();

  const parent = parents.at(-1);

  const rows = parent?.children.filter(
    (child) => child.type === 'element' && child.tagName === 'tr',
  );

  const striped =
    parent?.type === 'element' &&
    (parent as Element).tagName === 'tbody' &&
    (rows?.indexOf(node) ?? 0) % 2 === 1;

  return (
    <View
      {...props}
      style={[
        { flexDirection: 'row', backgroundColor: striped ? colors.codeBackground : undefined },
        styles.tableRow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const NodeRenderer = ({
  Raw: _Raw,
  current: node,
  parents,
  render,
  renderChildren,
  ...elementProps
}: NodeProps) => {
  const parent = parents[parents.length - 1];

  const inlineParent =
    parent?.type === 'element' && INLINE_PARENTS.has((parent as Element).tagName);

  if (node.type === 'text') {
    const index = parent?.children.indexOf(node) ?? -1;

    const previous = index > 0 ? parent?.children[index - 1] : undefined;

    const value =
      previous?.type === 'element' && previous.tagName === 'br'
        ? node.value.replace(/^\r?\n/, '')
        : node.value;

    return !inlineParent && !value.trim() ? null : <Text {...elementProps}>{value}</Text>;
  }

  if (node.type !== 'element' || !isSafeTagName(node.tagName)) {
    return null;
  }

  const props = { ...getReactNativeProps(node), ...elementProps };

  if (node.tagName === 'input') {
    return null;
  }

  if (node.tagName === 'hr') {
    return <Rule {...props} />;
  }

  if (node.tagName === 'li') {
    return (
      <ListItem
        {...props}
        node={node}
        parents={parents}
        render={render}
        renderChildren={renderChildren}
      />
    );
  }

  if (node.tagName === 'tr') {
    return (
      <TableRow {...props} node={node} parents={parents}>
        {renderChildren(node)}
      </TableRow>
    );
  }

  if (['thead', 'tbody', 'tfoot'].includes(node.tagName)) {
    return <View {...props}>{renderChildren(node)}</View>;
  }

  if (node.tagName === 'code') {
    return <InlineCode {...props}>{renderChildren(node)}</InlineCode>;
  }

  if (node.tagName === 'del' || node.tagName === 's') {
    return <DeletedText {...props}>{renderChildren(node)}</DeletedText>;
  }

  if (node.tagName === 'u') {
    return (
      <Text {...props} style={[{ textDecorationLine: 'underline' }, props.style]}>
        {renderChildren(node)}
      </Text>
    );
  }

  if (!isBlockNode(node)) {
    return <Text {...props}>{renderChildren(node)}</Text>;
  }

  return <View {...props}>{renderBlocks(node.children, render)}</View>;
};
