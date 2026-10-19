import { random } from 'lodash-es';
import { useEffect, useState } from 'react';

import type { SmoothStreamingProps } from './type';

import { useResolvedTheme } from '../../../.storybook/theme-addon';
import { Fluxdown } from '../../../src';
import { SMOOTH_MARKDOWN } from './consts';
import '../playground/style.scss';

export const SmoothStreaming = ({ initialText = SMOOTH_MARKDOWN }: SmoothStreamingProps) => {
  const [cursor, setCursor] = useState(0);

  const [playing, setPlaying] = useState(false);

  const [shad, setShad] = useState(true);

  const [shadLength, setShadLength] = useState(10);

  const [maskWidth, setMaskWidth] = useState(15);

  const theme = useResolvedTheme();

  const complete = cursor >= initialText.length;

  const text = initialText.slice(0, cursor);

  const status = complete
    ? 'Input complete'
    : playing
      ? 'Streaming'
      : cursor > 0
        ? 'Paused'
        : 'Ready';

  useEffect(() => {
    if (!playing || complete) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setCursor((current) => Math.min(current + random(1, 24), initialText.length));
      },
      random(50, 350),
    );

    return () => window.clearTimeout(timer);
  }, [complete, cursor, initialText.length, playing]);

  const handlePlay = () => {
    if (complete) {
      setCursor(0);
    }

    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    setPlaying(false);

    setCursor(0);
  };

  return (
    <main className="playground">
      <header className="playground-toolbar">
        <h1>Smooth streaming</h1>

        <span aria-live="polite" className="playground-status">
          {status}
        </span>

        <span className="playground-meta">1–24 characters every 50–350 ms</span>

        <div className="playground-actions">
          <button
            className="playground-primary"
            disabled={(playing && !complete) || initialText.length === 0}
            onClick={handlePlay}
            type="button"
          >
            Play
          </button>

          <button disabled={!playing || complete} onClick={handlePause} type="button">
            Pause
          </button>

          <button onClick={handleReset} type="button">
            Reset
          </button>
        </div>
      </header>

      <fieldset className="playground-transport">
        <legend>Shad controls</legend>

        <label>
          <input
            aria-label="Shad"
            checked={shad}
            onChange={(event) => setShad(event.currentTarget.checked)}
            type="checkbox"
          />
          Shad
        </label>

        <label>
          Shad length
          <input
            aria-label="Shad length"
            max={12}
            min={0}
            onChange={(event) => setShadLength(Number(event.currentTarget.value))}
            type="range"
            value={shadLength}
          />
          <output>{shadLength} chars</output>
        </label>

        <label>
          Mask width
          <input
            aria-label="Mask width"
            max={40}
            min={0}
            onChange={(event) => setMaskWidth(Number(event.currentTarget.value))}
            type="range"
            value={maskWidth}
          />
          <output>{maskWidth} px</output>
        </label>
      </fieldset>

      <div className="playground-workspace">
        <section aria-label="Incoming Markdown" className="playground-pane">
          <div className="playground-pane-heading">
            <h2>Incoming chunks</h2>

            <span className="playground-meta">
              {cursor}/{initialText.length} chars received
            </span>
          </div>

          <pre aria-label="Markdown stream" className="playground-source">
            <span>{text}</span>

            <span className="playground-unplayed">{initialText.slice(cursor)}</span>
          </pre>
        </section>

        <section aria-label="Smooth preview" className="playground-pane">
          <div className="playground-pane-heading">
            <h2>Smoothed render</h2>

            <span className="playground-meta">Gradual reveal</span>
          </div>

          <div className="playground-preview-content">
            <Fluxdown
              streaming={{ effect: ['shad', { enabled: shad, length: shadLength, maskWidth }] }}
              text={text}
              theme={theme}
            />
          </div>
        </section>
      </div>
    </main>
  );
};
