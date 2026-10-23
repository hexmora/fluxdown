import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useEffect, useState } from 'react';

import { useLocale } from '../../../hooks';
import { PauseIcon, PlayIcon, ReplayIcon } from '../../../icons';
import { getDemoTheme } from '../../utils';
import { COPY } from './consts';
import styles from './index.module.scss';

export const ArchitectureDemo = () => {
  const { lang } = useLocale();
  const dark = useDark();
  const labels = COPY[lang];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const finalStep = labels.steps.length - 1;
  const current = labels.steps[step];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(media.matches);

      if (media.matches) {
        setPlaying(false);
      }
    };
    const pauseWhenHidden = () => {
      if (document.hidden) {
        setPlaying(false);
      }
    };

    update();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', pauseWhenHidden);

    return () => {
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) {
      return;
    }

    if (step === finalStep) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => setStep(step + 1), 2100);

    return () => window.clearTimeout(timer);
  }, [finalStep, playing, reducedMotion, step]);

  const selectStep = (next: number) => {
    setPlaying(false);
    setStep(next);
  };

  return (
    <section aria-label={labels.label} className={styles.demo} data-demo="architecture">
      <div className={styles.toolbar}>
        <span>{labels.caption}</span>
        <div className={styles.controls}>
          {!reducedMotion && (
            <button
              aria-label={playing ? labels.pause : labels.play}
              onClick={() => {
                if (step === finalStep) {
                  setStep(0);
                }

                setPlaying(!playing);
              }}
              title={playing ? labels.pause : labels.play}
              type="button"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
          <button disabled={step === finalStep} onClick={() => selectStep(step + 1)} type="button">
            {labels.next}
          </button>
          <button
            aria-label={labels.reset}
            onClick={() => selectStep(0)}
            title={labels.reset}
            type="button"
          >
            <ReplayIcon />
          </button>
        </div>
      </div>

      <div aria-label={labels.caption} className={styles.steps}>
        {labels.steps.map((item, index) => (
          <button
            aria-current={index === step ? 'step' : undefined}
            className={styles.step}
            data-reached={index <= step}
            key={item.code}
            onClick={() => selectStep(index)}
            type="button"
          >
            <span className={styles.number}>0{index + 1}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      <div aria-atomic="true" aria-live="polite" className={styles.detail}>
        <code>{current.code}</code>
        <strong>{current.title}</strong>
        <p>{current.description}</p>
      </div>

      <div className={styles.panels}>
        <div className={styles.source}>
          <span className={styles.label}>{labels.input}</span>
          <pre>{labels.source}</pre>
          <div className={styles.tags}>
            <span>{labels.retained}</span>
            <span data-active={step >= 1}>{labels.changed}</span>
          </div>
        </div>
        <div className={styles.preview}>
          <span className={styles.label}>{labels.output}</span>
          <Fluxdown
            className={styles.rendered}
            streaming={{ repairEnding: true, smooth: false, effect: false }}
            text={step === finalStep ? labels.source : labels.original}
            theme={getDemoTheme(dark)}
          />
          <span className={styles.status}>
            {step === finalStep ? labels.changed : labels.waiting}
          </span>
        </div>
      </div>
      <p className={styles.note}>
        {labels.note} {reducedMotion && labels.reduced}
      </p>
    </section>
  );
};
