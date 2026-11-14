import type { Parent, RootContent, Text } from 'mdast';

export const INLINE_PARENT_TYPES: string[] = [
  'delete',
  'emphasis',
  'link',
  'linkReference',
  'strong',
];

const TRAILING_LINE_ENDINGS = /[\r\n]+$/;

export const getTrailingBreakChildren = (parent: Parent): RootContent[] | undefined => {
  let end = parent.children.length;

  while (end > 0) {
    const child = parent.children[end - 1];

    if (!child) {
      break;
    }

    if (child.type === 'break') {
      end -= 1;

      continue;
    }

    if (child.type !== 'text') {
      break;
    }

    const value = child.value.replace(TRAILING_LINE_ENDINGS, '');

    if (value === child.value) {
      break;
    }

    if (value.length > 0) {
      const { source: _source, ...data } = child.data ?? {};

      const text: Text = { ...child, value, data };

      if (Object.keys(data).length === 0) {
        delete text.data;
      }

      return [...parent.children.slice(0, end - 1), text];
    }

    end -= 1;
  }

  return end === parent.children.length ? undefined : parent.children.slice(0, end);
};
