import type { Element } from 'hast';

/**
 * Only pass native metadata through; HTML events and CSS are not native props.
 */
export const getReactNativeProps = (node?: Element): Record<string, unknown> => {
  const properties = node?.type === 'element' ? node.properties : undefined;

  if (!properties) {
    return {};
  }

  const result: Record<string, unknown> = {};

  if (typeof properties.id === 'string') {
    result.nativeID = properties.id;
  }

  const label = properties.ariaLabel ?? properties['aria-label'];

  if (typeof label === 'string') {
    result.accessibilityLabel = label;
  }

  if (node?.type === 'element' && node.tagName === 'img') {
    for (const key of ['width', 'height']) {
      const dimension = Number(properties[key]);

      if (Number.isFinite(dimension) && dimension > 0) {
        result[key] = dimension;
      }
    }
  }

  return result;
};
