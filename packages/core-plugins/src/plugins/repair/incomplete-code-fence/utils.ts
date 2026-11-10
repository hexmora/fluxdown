import type { Code } from 'mdast';

export const getIncompleteFenceValue = (node: Code): string | undefined => {
  const source = node.data?.source;

  if (source === undefined) {
    return undefined;
  }

  const opener = /^ {0,3}(`{3,}|~{3,})/.exec(source)?.[1];

  const tail = /(?:^|\r\n|\r|\n) {0,3}(`+|~+)$/.exec(node.value);

  const marker = tail?.[1];

  if (
    !opener ||
    !tail ||
    !marker ||
    marker.charAt(0) !== opener.charAt(0) ||
    marker.length >= opener.length ||
    /(`+|~+)$/.exec(source)?.[0] !== marker
  ) {
    return undefined;
  }

  return node.value.slice(0, tail.index);
};
