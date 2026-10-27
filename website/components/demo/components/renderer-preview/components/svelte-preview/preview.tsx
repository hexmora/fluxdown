import { useLayoutEffect, useRef, useState } from 'react';
import { mount, unmount } from 'svelte';
import { writable } from 'svelte/store';

import type { SveltePreviewProps } from './type';

import { PreviewHost } from './components/preview-host';

export const Preview = (props: SveltePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [source] = useState(() => writable(props));

  useLayoutEffect(() => {
    const target = containerRef.current;

    if (!target) {
      return;
    }

    const app = mount(PreviewHost, { target, props: { source } });

    return () => {
      void unmount(app);
    };
  }, [source]);

  useLayoutEffect(() => {
    source.set(props);
  }, [props, source]);

  return <div ref={containerRef} />;
};
