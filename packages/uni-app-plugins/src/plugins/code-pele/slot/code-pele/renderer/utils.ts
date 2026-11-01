import type { LiteElement } from 'mathjax-full/js/adaptors/lite/Element.js';

import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';

import type { SvgImageData } from '../../../../../base/components';
import type { ThemeTokens } from '../../../../../typings/theme';
import type { Diagram } from './type';

import { DIAGRAM_OPTIONS } from './consts';

const adaptor = /*#__PURE__*/ liteAdaptor();

export const renderDiagram = async (code: string, idPrefix: string): Promise<Diagram> => {
  const { render } = await import('pele');

  return render(code, { ...DIAGRAM_OPTIONS, idPrefix });
};

const resolveValue = (
  value: string,
  variables: Record<string, string>,
  path: string[] = [],
): string => {
  return value.replace(
    /var\((--[\w-]+)(?:,\s*([^()]*))?\)/g,
    (_, name: string, fallback: string | undefined) => {
      if (path.includes(name)) {
        return fallback ?? 'inherit';
      }

      const next = variables[name] ?? fallback ?? 'inherit';

      return resolveValue(next, variables, [...path, name]);
    },
  );
};

const getVariables = ({
  colors,
  typography,
  syntax,
  radius,
}: ThemeTokens): Record<string, string> => ({
  '--pele-bg': colors.bg,
  '--pele-fg': colors.fg,
  '--pele-muted': colors.fgMuted,
  '--pele-line': colors.fgMuted,
  '--pele-surface': colors.surfaceSubtle,
  '--pele-surface-alt': colors.surfaceMuted,
  '--pele-border': colors.borderEmphasis,
  '--pele-accent': colors.accent,
  '--pele-font': typography.fontSans || 'sans-serif',
  '--pele-font-mono': typography.fontMono,
  '--pele-radius': `${radius.sm}px`,
  '--pele-series-1': colors.accent,
  '--pele-series-2': syntax.function,
  '--pele-series-3': syntax.inserted,
  '--pele-series-4': syntax.variable,
  '--pele-series-5': syntax.string,
  '--pele-series-6': syntax.keyword,
  '--pele-series-7': syntax.number,
  '--pele-series-8': syntax.deleted,
});

export const toDiagramImage = (diagram: Diagram, theme: ThemeTokens): SvgImageData | null => {
  const { width, height } = diagram;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  const document = adaptor.parse(diagram.svg, 'text/html');

  const root = adaptor.tags(adaptor.body(document), 'svg')[0];

  if (!root || adaptor.tags(root, 'foreignobject').length) {
    return null;
  }

  const visit = (node: LiteElement, inherited: Record<string, string>, inheritedColor: string) => {
    const style = String(adaptor.getAttribute(node, 'style') ?? '');

    const own = Object.fromEntries(
      [...style.matchAll(/(?:^|;)\s*(--[\w-]+)\s*:\s*([^;]*)/g)].map((match) => [
        match[1]!,
        match[2]!.trim(),
      ]),
    );

    const variables = { ...inherited, ...own };

    for (const [name, value] of Object.entries(own)) {
      variables[name] = resolveValue(value, variables);
    }

    const color = resolveValue(
      /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)?.[1] ??
        String(adaptor.getAttribute(node, 'color') ?? inheritedColor),
      variables,
    ).replace(/currentColor/gi, inheritedColor);

    for (const { name, value } of adaptor.allAttributes(node)) {
      const current =
        name === 'style' ? value.replace(/(?:^|;)\s*--[\w-]+\s*:[^;]*(?=;|$)/g, '') : value;

      adaptor.setAttribute(
        node,
        name,
        resolveValue(current, variables).replace(/currentColor/gi, color),
      );
    }

    for (const child of adaptor.childNodes(node)) {
      if ('children' in child) {
        visit(child, variables, color);
      }
    }
  };

  visit(root, getVariables(theme), theme.colors.fg);

  // The lightweight parser lowercases tags; SVG resources retain their original names.
  const names = Object.fromEntries(
    [...diagram.svg.matchAll(/<\/?([a-zA-Z][\w:-]*)/g)].map((match) => [
      match[1]!.toLowerCase(),
      match[1]!,
    ]),
  );

  const svg = adaptor
    .outerHTML(root)
    .replace(
      /(<\/?)([a-zA-Z][\w:-]*)/g,
      (_, opening: string, name: string) => opening + (names[name] ?? name),
    );

  return { src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, width, height };
};
