import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';

import type { EditorProps } from './type';

import { DEMO_BUILD, DEMO_PLUGINS, getDemoTheme } from '../../../demo';
import { PauseIcon, PlayIcon, ReplayIcon, ResetIcon } from '../../../icons';
import { COPY } from './consts';
import { useEditor } from './hooks';
import styles from './index.module.scss';

export const Editor = ({ lang }: EditorProps) => {
  const copy = COPY[lang];
  const dark = useDark();
  const {
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
  } = useEditor(lang);
  const playLabel = stream.playing ? copy.pause : copy.play;

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
                streaming={stream.playing ? { smooth, shad: smooth, repairEnding: repair } : false}
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
