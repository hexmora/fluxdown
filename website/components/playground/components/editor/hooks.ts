import { useState } from 'react';

import type { Locale } from '../../../type';
import type { AnimationSpeed, EditorEffect, EditorTuning } from './type';

import { getStreamSample } from '../../../demo';
import { useStream } from '../../../hooks';
import { CHUNK_PACES, DEFAULT_TUNING } from './consts';
import { createClockTicker, createTunableSpring, PlaybackClock } from './utils';

export const useEditor = (lang: Locale) => {
  const [text, setText] = useState(() => getStreamSample(lang));

  const [smooth, setSmooth] = useState(true);

  const [repair, setRepair] = useState(true);

  const [effect, setEffect] = useState<EditorEffect>('scale');

  const [playback, setPlayback] = useState(false);

  const [speed, setSpeed] = useState<AnimationSpeed>(1);

  const [clock] = useState(() => new PlaybackClock());

  // One ticker class per editor, so speed changes reach the running spring without replacing it.
  const [ticker] = useState(() => createClockTicker(clock));

  const [tuning, setTuning] = useState(DEFAULT_TUNING);

  const [spring] = useState(() => createTunableSpring(DEFAULT_TUNING));

  // Arrivals follow both the playback speed and the chosen pace.
  const stream = useStream(playback ? text : '', false, speed / CHUNK_PACES[tuning.pace]);

  const previewText = playback ? stream.text : text;

  const updateText = (value: string) => {
    setPlayback(false);

    setText(value);
  };

  const togglePlayback = () => {
    if (!playback) {
      setPlayback(true);

      return;
    }

    if (stream.complete) {
      stream.replay();

      return;
    }

    stream.toggle();
  };

  const resetContent = () => updateText(getStreamSample(lang));

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
    text,
    smooth,
    setSmooth,
    repair,
    setRepair,
    effect,
    setEffect,
    speed,
    changeSpeed,
    ticker,
    scheduler: spring.Scheduler,
    tuning,
    changeTuning,
    playback,
    stream,
    previewText,
    updateText,
    togglePlayback,
    resetContent,
  };
};
