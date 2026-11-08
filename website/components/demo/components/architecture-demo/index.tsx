/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Each output pane supports keyboard scrolling. */

import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';

import { useBottomScroll } from '../../../bottom-scroll';
import { useLocale } from '../../../hooks';
import { COPY, PROCESSORS } from './consts';
import { usePipeline } from './hooks';
import styles from './index.module.scss';
import { ChunkList, MarkdownList, SourceEditor, TreeList } from './views';

const ScrollColumn = ({
  label,
  stage,
  reducedMotion,
  children,
}: {
  label: string;
  stage: string;
  reducedMotion: boolean;
  children: ReactNode;
}) => {
  const { viewportRef, contentRef } = useBottomScroll(reducedMotion, 'active');

  return (
    <section
      aria-label={label}
      className={styles.column}
      data-stage={stage}
      ref={viewportRef}
      tabIndex={0}
    >
      <div ref={contentRef}>{children}</div>
    </section>
  );
};

const PipelineContent = ({
  text,
  smooth,
  lang,
  reducedMotion,
  onChange,
}: {
  text: string;
  smooth: boolean;
  lang: 'zh' | 'en';
  reducedMotion: boolean;
  onChange(text: string): void;
}) => {
  const labels = COPY[lang];
  const pipeline = usePipeline(text, smooth);

  return (
    <div className={styles.scroll}>
      <div className={styles.pipeline}>
        <div className={styles.headings}>
          {labels.columns.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div aria-hidden="true" className={styles.processors}>
          {PROCESSORS.map((name) => (
            <span key={name}>
              {name}
              <b>→</b>
            </span>
          ))}
        </div>
        <div className={styles.columns}>
          <div className={`${styles.column} ${styles.sourceColumn}`} data-stage="input">
            <SourceEditor
              text={text}
              onChange={onChange}
              label={labels.edit}
              reducedMotion={reducedMotion}
            />
          </div>
          <ScrollColumn label={labels.columns[1]} stage="chunks" reducedMotion={reducedMotion}>
            <ChunkList sections={pipeline.sections} />
          </ScrollColumn>
          <ScrollColumn label={labels.columns[2]} stage="compiled" reducedMotion={reducedMotion}>
            <TreeList blocks={pipeline.compiled} />
          </ScrollColumn>
          <ScrollColumn label={labels.columns[3]} stage="mapped" reducedMotion={reducedMotion}>
            <TreeList blocks={pipeline.mapped} />
          </ScrollColumn>
          <ScrollColumn label={labels.columns[4]} stage="rendered" reducedMotion={reducedMotion}>
            <MarkdownList blocks={pipeline.rendered} />
          </ScrollColumn>
        </div>
      </div>
    </div>
  );
};

const PipelineDemo = ({ lang }: { lang: 'zh' | 'en' }) => {
  const labels = COPY[lang];
  const [text, setText] = useState(labels.chunks[0]);
  const [received, setReceived] = useState(1);
  const [cycle, setCycle] = useState(0);
  const [smooth, setSmooth] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <section aria-label={labels.label} className={styles.demo} data-demo="architecture">
      <div className={styles.toolbar}>
        <span>{labels.hint}</span>
        <div className={styles.controls}>
          <label>
            <input
              aria-label={labels.smooth}
              checked={smooth}
              disabled={reducedMotion}
              onChange={(event) => setSmooth(event.currentTarget.checked)}
              type="checkbox"
            />
            {labels.smooth}
          </label>
          <button
            onClick={() => {
              setText(labels.chunks[0]);
              setReceived(1);
              setCycle((current) => current + 1);
            }}
            type="button"
          >
            {labels.reset}
          </button>
          <button
            disabled={received === labels.chunks.length}
            onClick={() => {
              setText((current) => current + labels.chunks[received]);
              setReceived((current) => current + 1);
            }}
            type="button"
          >
            {labels.append}
          </button>
        </div>
      </div>
      <PipelineContent
        key={`${cycle}:${smooth && !reducedMotion}`}
        text={text}
        smooth={smooth && !reducedMotion}
        lang={lang}
        reducedMotion={reducedMotion}
        onChange={setText}
      />
    </section>
  );
};

export const ArchitectureDemo = () => {
  const { lang } = useLocale();
  return <PipelineDemo key={lang} lang={lang} />;
};
