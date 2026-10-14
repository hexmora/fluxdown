import { useLang, withBase } from '@rspress/core/runtime';
import { useEffect, useState } from 'react';

import type { Locale, Stream } from './type';

import { createStream } from './utils';

export const useLocale = () => {
  const lang: Locale = useLang() === 'zh' ? 'zh' : 'en';

  return {
    lang,
    href: (path: string) => withBase(`${lang === 'zh' ? '/zh' : ''}${path}`),
  };
};

export const useStream = (source: string, reducedMotion: boolean | null) => {
  const [stream, setStream] = useState<Stream>({
    source,
    frames: [],
    cursor: 0,
    step: 0,
    playing: false,
  });
  const isCurrent = stream.source === source;
  const currentCursor = isCurrent ? stream.cursor : 0;
  const cursor = reducedMotion ? source.length : currentCursor;
  const complete = cursor >= source.length;
  const playing = isCurrent && reducedMotion === false && stream.playing && !complete;

  useEffect(() => {
    if (reducedMotion !== null) {
      setStream(createStream(source, reducedMotion));
    }
  }, [reducedMotion, source]);

  useEffect(() => {
    const frame = stream.frames[stream.step];

    if (!playing || !frame) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStream((current) => {
        if (current !== stream) {
          return current;
        }

        return {
          ...current,
          cursor: frame.end,
          step: current.step + 1,
          playing: frame.end < source.length,
        };
      });
    }, frame.delay);

    return () => window.clearTimeout(timer);
  }, [playing, source.length, stream]);

  return {
    complete,
    playing,
    progress: source.length === 0 ? 1 : cursor / source.length,
    replay: () => setStream(createStream(source, reducedMotion !== false)),
    text: source.slice(0, cursor),
    toggle: () => setStream((current) => ({ ...current, playing: !current.playing })),
  };
};
