import { computed, defineComponent, onScopeDispose, ref, watch } from 'vue';

import type { SmoothStreamingProps } from './type';

import { Fluxdown } from '../../../src/packs/full';
import { CHUNK_INTERVAL, CHUNK_SIZES } from './consts';
import styles from './index.module.scss';

export const SmoothStreaming = /*#__PURE__*/ defineComponent(
  (props: SmoothStreamingProps) => {
    const cursor = ref(0);

    const playing = ref(false);

    const cycle = ref(0);

    const complete = computed(() => cursor.value >= props.initialText.length);

    let timer: ReturnType<typeof setInterval> | undefined;

    let tick = 0;

    const stop = () => {
      clearInterval(timer);

      timer = undefined;

      playing.value = false;
    };

    const reset = () => {
      stop();

      cursor.value = 0;

      tick = 0;

      cycle.value += 1;
    };

    const play = () => {
      if (playing.value) {
        return;
      }

      if (complete.value) {
        reset();
      }

      playing.value = true;

      timer = setInterval(() => {
        cursor.value = Math.min(
          cursor.value + CHUNK_SIZES[tick % CHUNK_SIZES.length],
          props.initialText.length,
        );

        tick += 1;

        if (complete.value) {
          stop();
        }
      }, CHUNK_INTERVAL);
    };

    watch(() => props.initialText, reset);

    onScopeDispose(stop);

    return () => {
      return (
        <main class={styles.shell}>
          <header class={styles.header}>
            <h1>{props.effect} streaming</h1>
            <p>Incoming chunks: 3–24 characters every {CHUNK_INTERVAL} ms.</p>
            <button disabled={playing.value} onClick={play} type="button">
              Play
            </button>
            <button disabled={!playing.value} onClick={stop} type="button">
              Pause
            </button>
            <button onClick={reset} type="button">
              Reset
            </button>
            <output aria-live="polite">
              {cursor.value}/{props.initialText.length} characters
            </output>
          </header>
          <Fluxdown
            build={{ footnote: true, tex: true }}
            key={cycle.value}
            streaming={
              !complete.value && { effect: props.effect, smooth: props.effect !== 'chunk' }
            }
            text={props.initialText.slice(0, cursor.value)}
          />
        </main>
      );
    };
  },
  { name: 'SmoothStreaming', props: ['initialText', 'effect'] },
);
