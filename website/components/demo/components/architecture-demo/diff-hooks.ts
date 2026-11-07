import { useState } from 'react';

import type { ListItem } from './diff';
import type { HastNode, TextSnapshot, TreeSnapshot } from './type';

import { diffList, diffText, diffTree } from './diff';

export const useTextDiff = (value: string, highlightInitial = true): TextSnapshot => {
  const [snapshot, setSnapshot] = useState<TextSnapshot>(() =>
    highlightInitial ? diffText(value) : { value, parts: [{ value }] },
  );

  if (snapshot.value !== value) {
    const next = diffText(value, snapshot);
    setSnapshot(next);
    return next;
  }

  return snapshot;
};

export const useTreeDiff = (node: HastNode): TreeSnapshot => {
  const [snapshot, setSnapshot] = useState(() => diffTree(node));

  if (snapshot.node !== node) {
    const next = diffTree(node, snapshot);
    // Equal trees may be republished with a new reference.
    const current = next === snapshot ? { ...next, node } : next;
    setSnapshot(current);
    return current;
  }

  return snapshot;
};

export const useListDiff = <T>(items: { key: string; value: T }[]): ListItem<T>[] => {
  const [state, setState] = useState(() => ({ items, diff: diffList(items, []) }));

  if (state.items !== items) {
    const next = { items, diff: diffList(items, state.diff) };
    setState(next);
    return next.diff;
  }

  return state.diff;
};
