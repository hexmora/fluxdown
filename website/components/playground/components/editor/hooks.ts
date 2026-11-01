import { useEffect, useState } from 'react';

import type { BottomScrollMode } from '../../../bottom-scroll';
import type { Renderer } from '../../../demo/components/renderer-preview';
import type { Locale } from '../../../type';
import type { AnimationSpeed, EditorEffect, EditorTuning } from './type';

import { getStreamSample, RENDERERS } from '../../../demo';
import { useStream } from '../../../hooks';
import { CHUNK_PACES, DEFAULT_TUNING } from './consts';
import { createClockDriver, createTunableSpring, PlaybackClock } from './utils';

const RENDERER_STORAGE_KEY = 'fluxdown:playground:renderer';

export const useEditor = (lang: Locale) => {
  const [renderer, setRendererState] = useState<Renderer>('react');

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RENDERER_STORAGE_KEY);
      if (RENDERERS.some(({ value }) => value === saved)) {
        setRendererState(saved as Renderer);
      }
    } catch {
      // Preview remains usable when browser storage is unavailable.
    }
  }, []);

  const setRenderer = (value: Renderer) => {
    setEditing(false);
    setRendererState(value);
    try {
      localStorage.setItem(RENDERER_STORAGE_KEY, value);
    } catch {
      // Keep the in-memory selection if storage is unavailable.
    }
  };

  const [text, setText] = useState(() => getStreamSample(lang));

  const [smooth, setSmooth] = useState(true);

  const [repair, setRepair] = useState(true);

  const [effect, setEffect] = useState<EditorEffect>('scale');

  const [playback, setPlayback] = useState(false);

  const [speed, setSpeed] = useState<AnimationSpeed>(1);

  const [clock] = useState(() => new PlaybackClock());

  // One driver class per editor, so speed changes reach the running spring without replacing it.
  const [driver] = useState(() => createClockDriver(clock));

  const [tuning, setTuning] = useState(DEFAULT_TUNING);

  const [spring] = useState(() => createTunableSpring(DEFAULT_TUNING));

  // Arrivals follow both the playback speed and the chosen pace.
  const stream = useStream(playback ? text : '', false, speed / CHUNK_PACES[tuning.pace]);

  const previewText = playback ? stream.text : text;

  const updateText = (value: string) => {
    setEditing(true);
    setPlayback(false);

    setText(value);
  };

  const togglePlayback = () => {
    if (!playback) {
      setEditing(false);
      setPlayback(true);

      return;
    }

    if (stream.complete) {
      stream.replay();

      return;
    }

    stream.toggle();
  };

  const resetContent = () => {
    setEditing(false);
    setPlayback(false);
    setText(getStreamSample(lang));
  };

  let scrollMode: BottomScrollMode = 'static';
  if (playback) {
    scrollMode = stream.playing ? 'active' : 'idle';
  } else if (editing) {
    scrollMode = 'active';
  }

  const changeSpeed = (value: AnimationSpeed) => {
    clock.setRate(value);

    setSpeed(value);
  };

  const changeTuning = (patch: Partial<EditorTuning>) => {
    const next = { ...tuning, ...patch };

    if (patch.frequency !== undefined || patch.dampingRatio !== undefined) {
      spring.retune(next);
    }

    setTuning(next);
  };

  return {
    renderer,
    setRenderer,
    text,
    smooth,
    setSmooth,
    repair,
    setRepair,
    effect,
    setEffect,
    speed,
    changeSpeed,
    driver,
    interpolation: spring.Interpolator,
    tuning,
    changeTuning,
    playback,
    stream,
    previewText,
    scrollMode,
    updateText,
    togglePlayback,
    resetContent,
  };
};
