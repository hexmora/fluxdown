import { computed, onScopeDispose, shallowRef, watch } from 'vue';

import type { CopyOptions, CopyState } from './type';

import { COPY_FEEDBACK_MS } from './consts';
import { copyText } from './utils';

export const useCopy = (props: CopyOptions) => {
  const state = shallowRef<CopyState | null>(null);

  let activeRequest: symbol | null = null;

  let timer: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    activeRequest = null;

    state.value = null;

    if (timer !== null) {
      clearTimeout(timer);

      timer = null;
    }
  };

  watch(() => [props.code, props.language, props.meta], reset);

  onScopeDispose(reset);

  const copy = async () => {
    if (activeRequest !== null) {
      return;
    }

    const { code, language, meta } = props;

    const request = Symbol();

    activeRequest = request;

    state.value = { code, language, meta, request, status: 'copying' };

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

    state.value = { code, language, meta, request, status: 'copied' };

    timer = setTimeout(reset, COPY_FEEDBACK_MS);

    props.onCopy?.({ code, language, meta });
  };

  return {
    copy,
    isCopied: computed(() => state.value?.status === 'copied'),
    isCopying: computed(() => state.value?.status === 'copying'),
  };
};
