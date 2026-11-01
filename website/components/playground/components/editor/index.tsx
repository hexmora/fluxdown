import { compute } from '@fluxdown/utils';
import { useDark } from '@rspress/core/runtime';

import type { EditorEffect, EditorProps } from './type';

import { useBottomScroll } from '../../../bottom-scroll';
import { DEMO_BUILD, RendererPreview, RENDERERS } from '../../../demo';
import { PauseIcon, PlayIcon, ReplayIcon, ResetIcon } from '../../../icons';
import { COPY } from './consts';
import { useEditor } from './hooks';
import styles from './index.module.scss';
import { getEditorEffect } from './utils';

export const Editor = ({ lang }: EditorProps) => {
  const copy = COPY[lang];

  const dark = useDark();

  const {
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
    scrollMode,
    updateText,
    togglePlayback,
    resetContent,
  } = useEditor(lang);

  const preview = useBottomScroll(false, scrollMode, renderer);

  const playLabel = stream.playing ? copy.pause : copy.play;

  return (
    <main className={styles.playground}>
      <div className={styles.heading}>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>

      <div className={styles.workspace}>
        <fieldset aria-label={copy.renderer} className={styles.renderers}>
          {RENDERERS.map(({ value, label }) => (
            <button
              aria-pressed={renderer === value}
              key={value}
              onClick={() => setRenderer(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </fieldset>
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
              <span className={styles.effectSelect}>
                <select
                  aria-label={copy.effect}
                  onChange={(event) => setEffect(event.currentTarget.value as EditorEffect)}
                  value={effect}
                >
                  <option value="none">{copy.noEffect}</option>
                  <option value="shad">{copy.shadEffect}</option>
                  <option value="scale">{copy.scaleEffect}</option>
                  <option value="chunk">{copy.chunkEffect}</option>
                  <option value="suffix-cursor">{copy.suffixCursorEffect}</option>
                  <option value="suffix-dot">{copy.suffixDotEffect}</option>
                </select>
              </span>
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

          <section aria-label={copy.preview} className={styles.preview} data-renderer={renderer}>
            {text.length === 0 ? <p className={styles.empty}>{copy.empty}</p> : null}
            {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Make the scrollable preview keyboard accessible. */}
            <section
              aria-label={copy.preview}
              className={styles.output}
              data-lynx={renderer === 'lynx'}
              ref={preview.viewportRef}
              tabIndex={0}
            >
              <div className={styles.previewContent} ref={preview.contentRef}>
                <RendererPreview
                  build={DEMO_BUILD}
                  dark={dark}
                  renderer={renderer}
                  scrollMode={scrollMode}
                  streaming={compute(() => {
                    if (!playback || stream.complete) return false;
                    return { smooth, effect: getEditorEffect(effect), repairEnding: repair };
                  })}
                  text={previewText}
                />
              </div>
            </section>
            {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
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
