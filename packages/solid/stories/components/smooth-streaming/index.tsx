import { createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js';

import type { SmoothStreamingProps } from './type';

import { Fluxdown } from '../../../src/packs/full';
import { CHUNK_INTERVAL, CHUNK_SIZES } from './consts';
import styles from './index.module.scss';

export const SmoothStreaming = (props: SmoothStreamingProps) => {
  const [cursor, setCursor] = createSignal(0);

  const [playing, setPlaying] = createSignal(false);

  const complete = createMemo(() => cursor() >= props.initialText.length);

  let timer: ReturnType<typeof setInterval> | undefined;

  let tick = 0;

  const stop = () => {
    clearInterval(timer);

    timer = undefined;

    setPlaying(false);
  };

  const reset = () => {
    stop();

    setCursor(0);

    tick = 0;
  };

  const play = () => {
    if (playing()) {
      return;
    }

    if (complete()) {
      reset();
    }

    setPlaying(true);

    timer = setInterval(() => {
      setCursor((current) =>
        Math.min(current + CHUNK_SIZES[tick % CHUNK_SIZES.length], props.initialText.length),
      );

      tick += 1;

      if (complete()) {
        stop();
      }
    }, CHUNK_INTERVAL);
  };

  createEffect(on(() => props.initialText, reset, { defer: true }));

  onCleanup(stop);

  return (
    <main class={styles.shell}>
      <header class={styles.header}>
        <h1>{props.effect} streaming</h1>
        <p>Incoming chunks: 3–24 characters every {CHUNK_INTERVAL} ms.</p>
        <button disabled={playing()} onClick={play} type="button">
          Play
        </button>
        <button disabled={!playing()} onClick={stop} type="button">
          Pause
        </button>
        <button onClick={reset} type="button">
          Reset
        </button>
        <output aria-live="polite">
          {cursor()}/{props.initialText.length} characters
        </output>
      </header>
      <Fluxdown
        build={{ footnote: true, tex: true }}
        streaming={!complete() && { effect: props.effect, smooth: props.effect !== 'chunk' }}
        text={props.initialText.slice(0, cursor())}
      />
    </main>
  );
};
