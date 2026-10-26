import type { XmlAST } from 'react-native-svg';

import type { ThemeTokens } from '../../../../../../../typings';
import type { Diagram } from './type';

const XML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
};

const decodeEntities = (value: string) =>
  value.replace(/&(amp|lt|gt|quot|apos);/g, (entity) => XML_ENTITIES[entity]);

export const decodeSvgEntities = (node: XmlAST): XmlAST => {
  node.children = node.children.map((child) =>
    typeof child === 'string' ? decodeEntities(child) : decodeSvgEntities(child),
  );

  for (const [key, value] of Object.entries(node.props)) {
    if (typeof value === 'string') {
      node.props[key] = decodeEntities(value);
    }
  }

  return node;
};

export const renderDiagram = async (
  source: string,
  tokens: ThemeTokens,
  id: string,
): Promise<Diagram | null> => {
  const { estimateText, layoutDiagram, lightTheme, parseDiagramAsync, renderToSvg } =
    await import('@osuki-dev/skia-diagrams');

  const parsed = await parseDiagramAsync(source);

  if (parsed.kind === 'error' || parsed.kind === 'unsupported') {
    return null;
  }

  const { colors, typography } = tokens;

  const theme = {
    ...lightTheme,
    background: colors.bg,
    nodeFill: colors.surfaceMuted,
    nodeStroke: colors.borderEmphasis,
    nodeText: colors.fg,
    edgeStroke: colors.fgMuted,
    edgeText: colors.fg,
    edgeTextBackground: colors.bg,
    clusterFill: colors.surfaceSubtle,
    clusterStroke: colors.border,
    clusterText: colors.fg,
    accent: colors.accent,
    noteFill: colors.surfaceMuted,
    noteText: colors.fg,
    fontFamily: typography.fontSans,
    fontFamilyMono: typography.fontMono,
    fontSize: typography.fontSize.sm,
  };

  const scene = layoutDiagram(parsed, estimateText, {
    ...theme.layout,
    fontSize: theme.fontSize,
    radius: theme.radius,
  });

  const svg = renderToSvg(scene, theme).replaceAll('diagram-gradient-', `${id}-gradient-`);

  return {
    svg,
    width: scene.bounds.width,
    height: scene.bounds.height,
    label: scene.accessibilityLabel,
  };
};
