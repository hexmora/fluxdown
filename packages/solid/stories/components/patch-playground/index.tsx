import type { IPatchItem } from '@fluxdown/core';
import type { JSX } from 'solid-js';

import { createSignal, Show } from 'solid-js';

import { Fluxdown } from '../../../src/packs/full';

export const PatchPlayground = () => {
  const [open, setOpen] = createSignal(false);

  const patches: IPatchItem<JSX.Element>[] = [
    {
      key: 'person-ada',
      range: [7, 11],
      render: () => {
        return (
          <button onClick={() => setOpen((value) => !value)} type="button">
            @Ada
          </button>
        );
      },
    },
  ];

  return (
    <main>
      <Fluxdown patches={patches} text="Hello, @Ada. Click the mention to open a Solid panel." />
      <Show when={open()}>
        <aside aria-label="Profile">Ada Lovelace · Profile opened from a patch.</aside>
      </Show>
    </main>
  );
};
