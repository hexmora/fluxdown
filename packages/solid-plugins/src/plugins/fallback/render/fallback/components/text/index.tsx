import { createRenderEffect } from 'solid-js';
import { isServer } from 'solid-js/web';

interface TextProps {
  value: string;
}

export const Text = (props: TextProps) => {
  if (isServer) {
    return props.value;
  }

  // Stable text leaves prevent list reconciliation from moving animated siblings.
  const node = document.createTextNode(props.value);

  createRenderEffect(() => {
    const value = props.value;

    if (node.data !== value) {
      node.data = value;
    }
  });

  return node;
};
