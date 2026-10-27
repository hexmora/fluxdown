import type { IPatchItem } from '@fluxdown/core';
import type { VNodeChild } from 'vue';

import { defineComponent, h, ref } from 'vue';

import { Fluxdown } from '../../../src/packs/full';

export const PatchPlayground = /*#__PURE__*/ defineComponent(() => {
  const open = ref(false);

  const patches: IPatchItem<VNodeChild>[] = [
    {
      key: 'person-ada',
      range: [7, 11],
      render: () => {
        return h(
          'button',
          {
            onClick: () => {
              open.value = !open.value;
            },
            type: 'button',
          },
          '@Ada',
        );
      },
    },
  ];

  return () => {
    return (
      <main>
        <Fluxdown patches={patches} text="Hello, @Ada. Click the mention to open a Vue panel." />
        {open.value && (
          <aside aria-label="Profile">Ada Lovelace · Profile opened from a patch.</aside>
        )}
      </main>
    );
  };
});
