import type { CodeHeaderProps } from '@fluxdown/react-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/react-plugins/base';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useState } from 'react';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { BURST_TIMING, COPY, EFFECTS } from './consts';
import styles from './index.module.scss';

export const RepairIntroDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [selected, setSelected] = useState(0);
  const [finished, setFinished] = useState(false);
  const sample = labels.samples[selected];
  const text = sample.partial + (finished ? sample.ending : '');

  return (
    <section aria-label={labels.repair} className={styles.demo} data-demo="intro-repair">
      <div className={styles.toolbar}>
        <fieldset aria-label={labels.repair} className={styles.choices}>
          {labels.samples.map(({ label }, index) => (
            <button
              aria-pressed={selected === index}
              key={label}
              onClick={() => {
                setSelected(index);
                setFinished(false);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </fieldset>
        <button className={styles.action} onClick={() => setFinished(!finished)} type="button">
          {finished ? labels.rewind : labels.finish}
        </button>
      </div>
      <div className={styles.source}>
        <span>{labels.received}</span>
        <code>{text}</code>
      </div>
      <div className={styles.comparison}>
        <div className={styles.pane}>
          <span className={styles.label}>{labels.plain}</span>
          <Fluxdown build={{ repair: false }} text={text} theme={getDemoTheme(dark)} />
        </div>
        <div className={styles.pane}>
          <span className={styles.label}>{labels.repaired}</span>
          <Fluxdown
            streaming={{ smooth: false, repairEnding: !finished, effect: false }}
            text={text}
            theme={getDemoTheme(dark)}
          />
        </div>
      </div>
    </section>
  );
};

export const StreamingIntroDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  // Six arrivals make the network bursts easy to distinguish from the reveal.
  const stream = useDemoStream('123456', BURST_TIMING);
  const text = labels.chunks.slice(0, stream.text.length).join('');
  const [effect, setEffect] = useState(1);

  return (
    <div data-demo="intro-streaming" ref={stream.containerRef}>
      <StreamingFrame caption={labels.flow} controls={stream} label={labels.flow}>
        <fieldset aria-label={labels.smooth} className={styles.effectChoices}>
          {labels.effects.map((label, index) => (
            <button
              aria-pressed={effect === index}
              key={label}
              onClick={() => {
                setEffect(index);
                stream.replay();
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </fieldset>
        <div className={styles.comparison}>
          <div className={`${styles.pane} ${styles.streamPane}`}>
            <span className={styles.label}>{labels.raw}</span>
            <Fluxdown
              streaming={{ smooth: false, effect: false }}
              text={text}
              theme={getDemoTheme(dark)}
            />
          </div>
          <div className={`${styles.pane} ${styles.streamPane}`}>
            <span className={styles.label}>{labels.smooth}</span>
            <Fluxdown
              key={`${lang}-${stream.cycle}`}
              streaming={stream.reducedMotion ? false : { smooth: true, effect: EFFECTS[effect] }}
              text={text}
              theme={getDemoTheme(dark)}
            />
          </div>
        </div>
      </StreamingFrame>
    </div>
  );
};

const PreviewCodeHeader = ({ Raw, ...props }: CodeHeaderProps) => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const [expanded, setExpanded] = useState(false);

  if (!Raw) {
    return null;
  }

  const previewAction = (
    <button
      aria-expanded={expanded}
      className={styles.action}
      onClick={() => setExpanded(!expanded)}
      type="button"
    >
      {expanded ? labels.hide : labels.preview}
    </button>
  );

  return (
    <>
      <Raw
        {...props}
        actions={(previous) => [
          ...previous,
          {
            key: 'preview',
            target: previewAction,
          },
        ]}
        left={<span className={styles.filename}>hello.ts</span>}
      />
      {expanded && (
        <output aria-label={labels.resultLabel} className={styles.result}>
          <span aria-hidden="true">↳</span> {labels.result}
        </output>
      )}
    </>
  );
};

class PreviewCodeHeaderPlugin extends BaseSlotPlugin<'CodeHeader'> {
  static readonly key = 'intro-preview-code-header';

  readonly type = 'CodeHeader';

  readonly Component = PreviewCodeHeader;
}

const SLOT_PLUGINS = { slots: [PreviewCodeHeaderPlugin] };

export const SlotIntroDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [custom, setCustom] = useState(true);

  return (
    <section aria-label={labels.slots} className={styles.demo} data-demo="intro-slots">
      <fieldset aria-label={labels.slots} className={styles.effectChoices}>
        {[labels.default, labels.custom].map((label, index) => (
          <button
            aria-pressed={custom === Boolean(index)}
            key={label}
            onClick={() => setCustom(Boolean(index))}
            type="button"
          >
            {label}
          </button>
        ))}
      </fieldset>
      <div className={styles.slotPreview}>
        <Fluxdown
          plugins={custom ? SLOT_PLUGINS : undefined}
          text={`\`\`\`ts\n${labels.code}\n\`\`\``}
          theme={getDemoTheme(dark)}
        />
      </div>
    </section>
  );
};
