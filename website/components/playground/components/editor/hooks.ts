import { useState } from 'react';

import type { Locale } from '../../../type';

import { getStreamSample } from '../../../demo';
import { useStream } from '../../../hooks';

export const useEditor = (lang: Locale) => {
  const [text, setText] = useState(() => getStreamSample(lang));
  const [smooth, setSmooth] = useState(true);
  const [repair, setRepair] = useState(true);
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
    text,
    smooth,
    setSmooth,
    repair,
    setRepair,
    playback,
    stream,
    previewText,
    updateText,
    togglePlayback,
    resetContent,
  };
};
