import { useEffect, useMemo, useState } from 'react';

import type { ChunkPacing, SmoothStreamingProps } from './type';

import { useResolvedTheme } from '../../../.storybook/theme-addon';
import { Fluxdown } from '../../../src';
import { StreamingLabControls, StreamingLabInspector, useStreamingLab } from '../streaming-lab';
import { Button, NumberField } from '../ui';
import { DEFAULT_PACING, SMOOTH_MARKDOWN } from './consts';
import { createChunkPlan } from './utils';
import '../playground/style.scss';

export const SmoothStreaming = ({
  initialText = SMOOTH_MARKDOWN,
  initialSettings,
  title = 'Smooth streaming',
}: SmoothStreamingProps) => {
  const lab = useStreamingLab(initialSettings);

  const theme = useResolvedTheme();

  const [pacing, setPacing] = useState(DEFAULT_PACING);

  const [step, setStep] = useState(0);

  const [playing, setPlaying] = useState(false);

  const plan = useMemo(() => createChunkPlan(initialText.length, pacing), [initialText, pacing]);

  const complete = step >= plan.length;

  const received = step === 0 ? 0 : (plan[step - 1]?.end ?? initialText.length);

  const previous = step <= 1 ? 0 : (plan[step - 2]?.end ?? 0);

  const text = initialText.slice(0, received);

  const status = complete
    ? 'Input complete'
    : playing
      ? 'Streaming'
      : step > 0
        ? 'Paused'
        : 'Ready';

  const { speed } = lab.settings;

  const delay = plan[step]?.delay;

  useEffect(() => {
    if (!playing || delay === undefined) {
      return;
    }

    // Arrivals slow down with the animation clock, so the whole timeline plays in slow motion.
    const timer = window.setTimeout(() => setStep((current) => current + 1), delay / speed);

    return () => window.clearTimeout(timer);
  }, [delay, playing, speed, step]);

  const restart = (next: ChunkPacing) => {
    setPacing(next);

    setStep(0);

    setPlaying(false);
  };

  const updatePacing = (patch: Partial<ChunkPacing>) => restart({ ...pacing, ...patch });

  const handlePlay = () => {
    if (complete) {
      setStep(0);
    }

    setPlaying(true);
  };

  const handleNextChunk = () => {
    setPlaying(false);

    setStep((current) => Math.min(plan.length, current + 1));
  };

  const handleFlush = () => {
    setPlaying(false);

    setStep(plan.length);
  };

  return (
    <main className="playground">
      <header className="playground-toolbar">
        <h1>{title}</h1>

        <span
          aria-live="polite"
          className="playground-status"
          data-state={playing && !complete ? 'live' : undefined}
        >
          {status}
        </span>

        <span className="playground-meta">
          Chunk {step}/{plan.length}
        </span>

        <div className="playground-actions">
          <Button disabled={playing && !complete} onClick={handlePlay} primary>
            {complete && step > 0 ? 'Replay' : 'Play'}
          </Button>

          <Button disabled={!playing || complete} onClick={() => setPlaying(false)}>
            Pause
          </Button>

          <Button disabled={complete} onClick={handleNextChunk}>
            Next chunk
          </Button>

          <Button disabled={complete} onClick={handleFlush}>
            Deliver all
          </Button>

          <Button onClick={() => restart(pacing)}>Reset</Button>
        </div>
      </header>

      <fieldset className="playground-transport">
        <legend>Chunk pacing</legend>

        <NumberField
          label="Min size"
          max={pacing.maxSize}
          min={1}
          onChange={(minSize) => updatePacing({ minSize })}
          unit="chars"
          value={pacing.minSize}
        />

        <NumberField
          label="Max size"
          max={200}
          min={pacing.minSize}
          onChange={(maxSize) => updatePacing({ maxSize })}
          unit="chars"
          value={pacing.maxSize}
        />

        <NumberField
          label="Min delay"
          max={pacing.maxDelay}
          min={0}
          onChange={(minDelay) => updatePacing({ minDelay })}
          step={10}
          unit="ms"
          value={pacing.minDelay}
        />

        <NumberField
          label="Max delay"
          max={5000}
          min={pacing.minDelay}
          onChange={(maxDelay) => updatePacing({ maxDelay })}
          step={10}
          unit="ms"
          value={pacing.maxDelay}
        />

        <NumberField
          label="Seed"
          min={0}
          onChange={(seed) => updatePacing({ seed })}
          value={pacing.seed}
        />

        <div className="playground-actions">
          <Button onClick={() => updatePacing({ seed: Math.floor(Math.random() * 100_000) })}>
            New seed
          </Button>
        </div>
      </fieldset>

      <StreamingLabControls lab={lab} />

      <StreamingLabInspector lab={lab} />

      <div className="playground-workspace">
        <section aria-label="Incoming Markdown" className="playground-pane">
          <div className="playground-pane-heading">
            <h2>Incoming chunks</h2>

            <span className="playground-meta">
              {received}/{initialText.length} chars received
            </span>
          </div>

          <pre aria-label="Markdown stream" className="playground-source">
            <span>{initialText.slice(0, previous)}</span>

            <span className="playground-latest" key={step}>
              {initialText.slice(previous, received)}
            </span>

            <span className="playground-unplayed">{initialText.slice(received)}</span>
          </pre>
        </section>

        <section aria-label="Smooth preview" className="playground-pane">
          <div className="playground-pane-heading">
            <h2>Smoothed render</h2>

            <span className="playground-meta">Visible units follow the spring</span>
          </div>

          <div className="playground-preview-content">
            <Fluxdown streaming={lab.streaming} text={text} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  );
};
