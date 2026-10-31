import { useEffect, useState } from 'react';

import type { Renderer } from '../renderer-preview';

import { RENDERERS } from '../renderer-preview';

const STORAGE_KEY = 'fluxdown:demo:renderers';

export const useRenderers = () => {
  const [selected, setSelected] = useState<Renderer[]>(() =>
    RENDERERS.slice(0, 3).map(({ value }) => value),
  );

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (!Array.isArray(saved)) return;

      const renderers = RENDERERS.filter(({ value }) => saved.includes(value)).map(
        ({ value }) => value,
      );
      if (renderers.length > 0) setSelected(renderers);
    } catch {
      // Keep the defaults when storage is unavailable or contains invalid JSON.
    }
  }, []);

  const toggleRenderer = (renderer: Renderer) => {
    if (selected.length === 1 && selected.includes(renderer)) return;

    const next = selected.includes(renderer)
      ? selected.filter((value) => value !== renderer)
      : [...selected, renderer];

    setSelected(next);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the in-memory selection if storage is unavailable.
    }
  };

  return { selected, toggleRenderer };
};
