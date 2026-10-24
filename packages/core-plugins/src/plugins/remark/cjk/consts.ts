import { gfmAutolinkLiteralFromMarkdown } from 'mdast-util-gfm-autolink-literal';

export const CJK_AUTOLINK_BOUNDARY = /([。．，、？！：；（）【】「」『』〈〉《》])/;

export const AUTOLINK_PREFIX_ONLY = /^(?:https?:\/\/|www\.|mailto:)$/i;

export const AUTOLINK_TRANSFORMS = gfmAutolinkLiteralFromMarkdown().transforms ?? [];
