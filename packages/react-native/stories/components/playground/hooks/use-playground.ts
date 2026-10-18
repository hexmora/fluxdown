import { useEffect, useMemo, useState } from 'react';

import type { PlaygroundProps } from '../type';

import { CHUNK_SIZE, PLAYBACK_INTERVAL } from '../consts';

export const usePlayground = ({ autoPlay = true, initialText }: PlaygroundProps) => {
  const characters = useMemo(() => Array.from(initialText), [initialText]);

  const [cursor, setCursor] = useState(0);

  const [playing, setPlaying] = useState(autoPlay);

  const total = characters.length;

  const complete = cursor >= total;

  const progress = total === 0 ? 0 : (cursor / total) * 100;

  useEffect(() => {
    setCursor(0);

    setPlaying(autoPlay && initialText.length > 0);
  }, [autoPlay, initialText]);

  useEffect(() => {
    if (!playing || complete) {
      return;
    }

    const timer = setInterval(() => {
      setCursor((current) => Math.min(current + CHUNK_SIZE, total));
    }, PLAYBACK_INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, [complete, playing, total]);

  const handlePlay = () => {
    if (total === 0) {
      return;
    }

    if (complete) {
      setCursor(0);
    }

    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    setCursor(0);

    setPlaying(false);
  };

  let status = '等待播放';

  if (total === 0) {
    status = '暂无内容';
  } else if (complete) {
    status = '播放完成';
  } else if (playing) {
    status = '正在播放';
  } else if (cursor > 0) {
    status = '已暂停';
  }

  return {
    complete,
    cursor,
    handlePause,
    handlePlay,
    handleReset,
    playing,
    previewText: characters.slice(0, cursor).join(''),
    progress,
    status,
    total,
  };
};
