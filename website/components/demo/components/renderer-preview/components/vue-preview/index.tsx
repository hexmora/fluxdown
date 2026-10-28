import { Fluxdown } from '@fluxdown/vue';
import { useLayoutEffect, useRef, useState } from 'react';
import { createApp, h, shallowReactive } from 'vue';

import type { VuePreviewProps } from './type';

export const VuePreview = (props: VuePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [state] = useState(() => shallowReactive({ ...props }));

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const app = createApp({
      render() {
        return h(Fluxdown, state);
      },
    });

    app.mount(container);

    return () => {
      app.unmount();
    };
  }, [state]);

  useLayoutEffect(() => {
    Object.assign(state, props);
  }, [props, state]);

  return <div ref={containerRef} />;
};
