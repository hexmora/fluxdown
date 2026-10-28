import type { Component, VNodeChild } from 'vue';

import { Fragment, h, isVNode } from 'vue';

import type { CodeHeaderAction } from '../../../../../base';

const isComponent = (target: Component | VNodeChild): target is Component =>
  typeof target === 'function' ||
  (typeof target === 'object' && target !== null && !Array.isArray(target) && !isVNode(target));

export const renderAction = ({ key, target }: CodeHeaderAction) => {
  return <Fragment key={key}>{isComponent(target) ? h(target) : target}</Fragment>;
};

export const copyText = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);

      return true;
    } catch {
      // The legacy command can still work when the Clipboard API is unavailable or denied.
    }
  }

  if (typeof document === 'undefined' || !document.execCommand) {
    return false;
  }

  const activeElement = document.activeElement;

  const selection = document.getSelection();

  const ranges = Array.from({ length: selection?.rangeCount ?? 0 }, (_, index) =>
    selection!.getRangeAt(index).cloneRange(),
  );

  const textarea = document.createElement('textarea');

  textarea.value = text;

  textarea.readOnly = true;

  textarea.tabIndex = -1;

  textarea.style.position = 'fixed';

  textarea.style.opacity = '0';

  textarea.style.pointerEvents = 'none';

  document.body.append(textarea);

  try {
    textarea.select();

    return document.execCommand('copy');
  } finally {
    textarea.remove();

    if (activeElement instanceof HTMLElement) {
      activeElement.focus({ preventScroll: true });
    }

    selection?.removeAllRanges();

    ranges.forEach((range) => selection?.addRange(range));
  }
};
