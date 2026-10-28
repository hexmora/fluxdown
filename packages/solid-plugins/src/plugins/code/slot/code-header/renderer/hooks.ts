import { createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js';

import type { CopyOptions, CopyState } from './type';

import { COPY_FEEDBACK_MS } from './consts';
import { copyText } from './utils';

export const createCopy = (props: CopyOptions) => {
  const [state, setState] = createSignal<CopyState | null>(null);

  let activeRequest: symbol | null = null;

  let timer: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    activeRequest = null;

    setState(null);

    if (timer !== null) {
      clearTimeout(timer);

      timer = null;
    }
  };

  createEffect(on(() => [props.code, props.language, props.meta], reset, { defer: true }));

  onCleanup(reset);

  const copy = async () => {
    if (activeRequest !== null) {
      return;
    }

    const { code, language, meta } = props;

    const request = Symbol();

    activeRequest = request;

    setState({ code, language, meta, request, status: 'copying' });

    let copied = false;

    try {
      copied = await copyText(code);
    } catch {
      // Browsers can deny both clipboard APIs; leave the action available to retry.
    }

    if (activeRequest !== request) {
      return;
    }

    if (!copied) {
      reset();

      return;
    }

    setState({ code, language, meta, request, status: 'copied' });

    timer = setTimeout(reset, COPY_FEEDBACK_MS);

    props.onCopy?.({ code, language, meta });
  };

  return {
    copy,
    isCopied: createMemo(() => state()?.status === 'copied'),
    isCopying: createMemo(() => state()?.status === 'copying'),
  };
};
