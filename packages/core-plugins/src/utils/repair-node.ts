import type { Parent, RootContent, RootContentMap } from 'mdast';

import { decodeString } from 'micromark-util-decode-string';

export const isRepairNodeType = <T extends keyof RootContentMap>(
  node: Parent | RootContent,
  type: T,
): node is Extract<RootContent, { type: T }> => {
  return node.type === type;
};

/** Fresh text fragments may retain verified, exactly corresponding raw source. */
export const hasRepairTextSource = (node: Parent | RootContent): boolean => {
  return (
    isRepairNodeType(node, 'text') &&
    typeof node.data?.source === 'string' &&
    decodeString(node.data.source) === node.value
  );
};
