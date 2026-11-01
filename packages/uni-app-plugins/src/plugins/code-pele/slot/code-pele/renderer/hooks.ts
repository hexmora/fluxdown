import { computed, shallowRef, watch } from 'vue';

import type { Diagram } from './type';

export const useDiagram = (source: () => { code: string; language?: string }, idPrefix: string) => {
  const diagram = shallowRef<Diagram | null>(null);

  const enabled = computed(() =>
    ['mermaid', 'mindmap'].includes(source().language?.toLowerCase() ?? ''),
  );

  watch(
    () => [source().code, enabled.value] as const,
    ([code, renderable], _, onCleanup) => {
      let active = true;

      onCleanup(() => {
        active = false;
      });

      if (!renderable || !code.trim()) {
        diagram.value = null;

        return;
      }

      async function render() {
        try {
          const { renderDiagram } = await import('./utils');

          const result = await renderDiagram(code, idPrefix);

          if (active) {
            diagram.value = result;
          }
        } catch {
          // Keep the last valid diagram while a streamed statement is incomplete.
        }
      }

      void render();
    },
    { immediate: true },
  );

  return computed(() => (enabled.value ? diagram.value : null));
};
