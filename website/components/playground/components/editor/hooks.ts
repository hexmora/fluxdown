import { useEffect, useState } from 'react';

import type { Renderer } from '../../../demo/components/renderer-preview';
import type { Locale } from '../../../type';
import type { EditorEffect } from './type';

import { getStreamSample, RENDERERS } from '../../../demo';
import { useStream } from '../../../hooks';

const RENDERER_STORAGE_KEY = 'fluxdown:playground:renderer';

export const useEditor = (lang: Locale) => {
  const [renderer, setRendererState] = useState<Renderer>('react');

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

  const stream = useStream(playback ? text : '', false);

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
    playback,
    stream,
    previewText,
    updateText,
    togglePlayback,
    resetContent,
  };
};
