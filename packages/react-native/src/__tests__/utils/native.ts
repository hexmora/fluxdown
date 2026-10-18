interface NativeNode {
  type: string;

  children?: (NativeNode | string)[] | null;
}

export const textContent = (node: NativeNode | NativeNode[] | string | null): string => {
  if (node === null) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  const children = Array.isArray(node) ? node : (node.children ?? []);

  return children.map(textContent).join('');
};

export const expectNativeTextContainers = (node: NativeNode | NativeNode[] | null): void => {
  if (node === null) {
    return;
  }

  if (Array.isArray(node)) {
    node.forEach(expectNativeTextContainers);

    return;
  }

  for (const child of node.children ?? []) {
    if (typeof child === 'string') {
      expect(node.type).toMatch(/Text/);
    } else {
      expectNativeTextContainers(child);
    }
  }
};
