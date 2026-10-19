import { compute } from '@fluxdown/utils';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useId, useState } from 'react';

import type { AnimationSpeed, ChunkPace, EditorEffect, EditorProps } from './type';

import { DEMO_BUILD, DEMO_PLUGINS, getDemoTheme } from '../../../demo';
import { PauseIcon, PlayIcon, ReplayIcon, ResetIcon } from '../../../icons';
import { ANIMATION_SPEEDS, CHUNK_PACES, COPY, DEFAULT_TUNING } from './consts';
import { useEditor } from './hooks';
import styles from './index.module.scss';
import { getDampingKind, getEffectConfig } from './utils';

export const Editor = ({ lang }: EditorProps) => {
  const copy = COPY[lang];

  const dark = useDark();

  const {
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
    scheduler,
    tuning,
    changeTuning,
    playback,
    stream,
    previewText,
    updateText,
    togglePlayback,
    resetContent,
  } = useEditor(lang);

  const playLabel = stream.playing ? copy.pause : copy.play;

  const [tuningOpen, setTuningOpen] = useState(false);

  const tuningId = useId();

  const paceLabels: Record<ChunkPace, string> = {
    fast: copy.paceFast,
    steady: copy.paceSteady,
    slow: copy.paceSlow,
  };

  return (
    <main className={styles.playground}>
      <div className={styles.heading}>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>

      <div className={styles.workspace}>
        <div className={styles.toolbar}>
          <div className={styles.options}>
            <label>
              <input
                aria-label={copy.smooth}
                checked={smooth}
                onChange={(event) => setSmooth(event.currentTarget.checked)}
                type="checkbox"
              />
              {copy.smooth}
            </label>
            <label>
              <input
                aria-label={copy.repair}
                checked={repair}
                onChange={(event) => setRepair(event.currentTarget.checked)}
                type="checkbox"
              />
              {copy.repair}
            </label>
            <label className={styles.effect}>
              {copy.effect}
              <span className={styles.select}>
                <select
                  aria-label={copy.effect}
                  onChange={(event) => setEffect(event.currentTarget.value as EditorEffect)}
                  value={effect}
                >
                  <option value="none">{copy.noEffect}</option>
                  <option value="shad">{copy.shadEffect}</option>
                  <option value="scale">{copy.scaleEffect}</option>
                </select>
              </span>
            </label>
            <label className={styles.effect}>
              {copy.speed}
              <span className={styles.select}>
                <select
                  aria-label={copy.speed}
                  onChange={(event) =>
                    changeSpeed(Number(event.currentTarget.value) as AnimationSpeed)
                  }
                  value={speed}
                >
                  {ANIMATION_SPEEDS.map((value) => (
                    <option key={value} value={value}>
                      {value}×
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <button
              aria-controls={tuningId}
              aria-expanded={tuningOpen}
              onClick={() => setTuningOpen((open) => !open)}
              type="button"
            >
              {copy.tune}
            </button>
          </div>
          <div className={styles.actions}>
            <button
              aria-label={playLabel}
              disabled={text.length === 0}
              onClick={togglePlayback}
              title={playLabel}
              type="button"
            >
              {stream.playing ? <PauseIcon /> : <PlayIcon />}
              {playLabel}
            </button>
            <button
              aria-label={copy.replay}
              disabled={!playback}
              onClick={stream.replay}
              title={copy.replay}
              type="button"
            >
              <ReplayIcon />
              {copy.replay}
            </button>
            <button aria-label={copy.reset} onClick={resetContent} title={copy.reset} type="button">
              <ResetIcon />
              {copy.reset}
            </button>
          </div>
        </div>

        {tuningOpen ? (
          <div className={styles.tuning} id={tuningId}>
            <label>
              {copy.frequency}
              <input
                aria-label={copy.frequency}
                max={20}
                min={1}
                onChange={(event) => changeTuning({ frequency: Number(event.currentTarget.value) })}
                step={0.5}
                type="range"
                value={tuning.frequency}
              />
              <output>{tuning.frequency.toFixed(1)} rad/s</output>
            </label>
            <label>
              {copy.damping}
              <input
                aria-label={copy.damping}
                max={2}
                min={0.2}
                onChange={(event) =>
                  changeTuning({ dampingRatio: Number(event.currentTarget.value) })
                }
                step={0.05}
                type="range"
                value={tuning.dampingRatio}
              />
              <output>
                {tuning.dampingRatio.toFixed(2)} · {copy[getDampingKind(tuning.dampingRatio)]}
              </output>
            </label>
            <label>
              {copy.pace}
              <span className={styles.select}>
                <select
                  aria-label={copy.pace}
                  onChange={(event) =>
                    changeTuning({ pace: event.currentTarget.value as ChunkPace })
                  }
                  value={tuning.pace}
                >
                  {(Object.keys(CHUNK_PACES) as ChunkPace[]).map((pace) => (
                    <option key={pace} value={pace}>
                      {paceLabels[pace]}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            {effect === 'shad' ? (
              <label>
                {copy.fadeLength}
                <input
                  aria-label={copy.fadeLength}
                  max={30}
                  min={1}
                  onChange={(event) =>
                    changeTuning({ fadeLength: Number(event.currentTarget.value) })
                  }
                  type="range"
                  value={tuning.fadeLength}
                />
                <output>
                  {tuning.fadeLength} {copy.characters}
                </output>
              </label>
            ) : null}
            {effect === 'scale' ? (
              <label>
                {copy.entranceDuration}
                <input
                  aria-label={copy.entranceDuration}
                  max={800}
                  min={50}
                  onChange={(event) =>
                    changeTuning({ entranceDuration: Number(event.currentTarget.value) })
                  }
                  step={10}
                  type="range"
                  value={tuning.entranceDuration}
                />
                <output>{tuning.entranceDuration} ms</output>
              </label>
            ) : null}
            <button onClick={() => changeTuning(DEFAULT_TUNING)} type="button">
              {copy.resetTuning}
            </button>
          </div>
        ) : null}

        <div className={styles.panels}>
          <div className={styles.source}>
            <textarea
              aria-label={copy.source}
              autoCapitalize="off"
              autoComplete="off"
              onChange={(event) => updateText(event.currentTarget.value)}
              placeholder={copy.placeholder}
              spellCheck={false}
              value={text}
            />
          </div>

          <section aria-label={copy.preview} className={styles.preview}>
            <div className={styles.output}>
              {text.length === 0 ? <p className={styles.empty}>{copy.empty}</p> : null}
              <Fluxdown
                build={DEMO_BUILD}
                plugins={DEMO_PLUGINS}
                streaming={compute(() => {
                  if (!stream.playing) {
                    return false;
                  }

                  return {
                    smooth: smooth && { enabled: true, ticker, scheduler },
                    effect: effect === 'none' ? false : getEffectConfig(effect, speed, tuning),
                    repairEnding: repair,
                  };
                })}
                text={previewText}
                theme={getDemoTheme(dark)}
              />
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <span>{copy.note}</span>
          <span>
            {text.length.toLocaleString(lang)} {copy.characters}
          </span>
        </div>
      </div>
    </main>
  );
};
