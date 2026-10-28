import { useLayoutEffect, useRef, useState } from 'react';
import { createComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { render } from 'solid-js/web';

import type { SolidPreviewProps } from './type';

export const SolidPreview = (props: SolidPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [[state, setState]] = useState(() => createStore({ ...props }));

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let active = true;

    let dispose: (() => void) | undefined;

    // This preview uses the browser build; load it after the React host mounts.
    void import('@fluxdown/solid').then(({ Fluxdown }) => {
      if (active) {
        dispose = render(() => createComponent(Fluxdown, state), container);
      }
    });

    return () => {
      active = false;

      dispose?.();
    };
  }, [state]);

  useLayoutEffect(() => {
    setState(() => props);
  }, [props, setState]);

  return <div ref={containerRef} />;
};
