import type { Change, HastNode, TextPart, TextSnapshot, TreeSnapshot } from './type';

let nextKey = 0;

const change = (kind: Change['kind']): Change => ({ id: ++nextKey, time: Date.now(), kind });

const sliceParts = (parts: TextPart[], from: number, to: number): TextPart[] => {
  let cursor = 0;
  const result: TextPart[] = [];

  for (const part of parts) {
    if (part.change?.kind === 'removed') {
      continue;
    }

    const start = Math.max(0, from - cursor);
    const end = Math.min(part.value.length, to - cursor);

    if (end > start) {
      result.push({ ...part, value: part.value.slice(start, end) });
    }

    cursor += part.value.length;
  }

  return result;
};

export const diffText = (value: string, previous?: TextSnapshot): TextSnapshot => {
  if (previous?.value === value) {
    return previous;
  }

  const before = Array.from(previous?.value ?? '');
  const after = Array.from(value);
  let start = 0;
  let end = 0;

  while (start < Math.min(before.length, after.length) && before[start] === after[start]) {
    start += 1;
  }

  while (
    end < Math.min(before.length, after.length) - start &&
    before[before.length - end - 1] === after[after.length - end - 1]
  ) {
    end += 1;
  }

  const prefixLength = before.slice(0, start).join('').length;
  const suffixLength = before.slice(before.length - end).join('').length;
  const removed = before.slice(start, before.length - end).join('');
  const added = after.slice(start, after.length - end).join('');
  const parts = sliceParts(previous?.parts ?? [], 0, prefixLength);

  const replacedEnd = (previous?.value.length ?? 0) - suffixLength;
  const ghosts = (previous?.parts ?? [])
    .filter((part) => part.change?.kind === 'removed' && Date.now() - part.change.time < 1600)
    .map((part) => {
      const position = part.position ?? 0;
      return Object.assign({}, part, {
        position:
          position <= prefixLength
            ? position
            : position >= replacedEnd
              ? position + added.length - (replacedEnd - prefixLength)
              : prefixLength + added.length,
      });
    });
  if (removed) {
    ghosts.push({ value: removed, position: prefixLength, change: change('removed') });
  }
  if (added) {
    parts.push({ value: added, change: change('added') });
  }

  parts.push(
    ...sliceParts(previous?.parts ?? [], (previous?.value.length ?? 0) - suffixLength, Infinity),
  );

  const visible: TextPart[] = [];
  let cursor = 0;
  // This freshly filtered array is private; the website targets ES2022.
  // oxlint-disable-next-line unicorn/no-array-sort
  for (const ghost of ghosts.sort((left, right) => (left.position ?? 0) - (right.position ?? 0))) {
    const position = Math.min(value.length, ghost.position ?? 0);
    visible.push(...sliceParts(parts, cursor, position), ghost);
    cursor = position;
  }
  visible.push(...sliceParts(parts, cursor, Infinity));

  return { value, parts: visible };
};

const labelOf = (node: HastNode) => {
  if (node.type !== 'element') {
    return node.type;
  }

  const props = Object.entries(node.properties)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(' ') : String(value)}`);

  return props.length ? `${node.tagName} ${props.join(' ')}` : node.tagName;
};

const childrenOf = (node: HastNode): HastNode[] => ('children' in node ? node.children : []);

const textOf = (node: HastNode) => ('value' in node ? node.value : '');

const signatureOf = (node: HastNode): string =>
  JSON.stringify([labelOf(node), textOf(node), childrenOf(node).map(signatureOf)]);

const sameKind = (left: HastNode, right: HastNode) =>
  left.type === right.type &&
  (left.type !== 'element' || (right.type === 'element' && left.tagName === right.tagName));

export const diffTree = (node: HastNode, previous?: TreeSnapshot): TreeSnapshot => {
  const signature = signatureOf(node);

  if (previous?.signature === signature) {
    return previous;
  }

  const next = childrenOf(node);
  const signatures = next.map(signatureOf);
  const unmatched = new Set(previous?.children ?? []);
  const children = next.map((child, index) => {
    const exact = [...unmatched].find((item) => item.signature === signatures[index]);
    const match =
      exact ??
      [...unmatched].find(
        (item) => sameKind(item.node, child) && !signatures.includes(item.signature),
      );

    if (match) {
      unmatched.delete(match);
    }

    return diffTree(child, match);
  });

  return {
    key: previous?.key ?? ++nextKey,
    signature,
    node,
    label: diffText(labelOf(node), previous?.label),
    text: diffText(textOf(node), previous?.text),
    children,
    removed: [
      ...(previous?.removed ?? []).filter(
        (item) => item.change && Date.now() - item.change.time < 1600,
      ),
      ...[...unmatched].map((item) => Object.assign({}, item, { change: change('removed') })),
    ],
    change: previous?.change ?? change('added'),
  };
};

export type ListItem<T> = { key: string; value: T; change?: Change };

export const diffList = <T>(
  next: { key: string; value: T }[],
  previous: ListItem<T>[],
): ListItem<T>[] => {
  const current = next.map(({ key, value }) => {
    const before = previous.find((item) => item.key === key && item.change?.kind !== 'removed');
    return { key, value, change: before?.change ?? change('added') };
  });
  const removed = previous
    .filter((item) => item.change?.kind !== 'removed' && !next.some(({ key }) => key === item.key))
    .map((item) => Object.assign({}, item, { change: change('removed') }));
  const ghosts = previous.filter(
    (item) =>
      item.change?.kind === 'removed' &&
      Date.now() - item.change.time < 1600 &&
      !next.some(({ key }) => key === item.key),
  );

  return [...current, ...ghosts, ...removed];
};
