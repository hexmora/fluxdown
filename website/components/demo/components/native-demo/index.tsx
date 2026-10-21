import type { StreamingConfig } from 'fluxdown';
import type { ComponentType } from 'react';

import { PRESET_LIGHT_PLUGINS } from '@fluxdown/react-presets/lite';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { FluxdownLite } from 'fluxdown/lite';
import { FluxdownRaw } from 'fluxdown/raw';
import { useEffect, useState } from 'react';

import type {
  NativeDemoEffect,
  NativeDemoPack,
  NativeDemoSample,
  NativePreviewProps,
} from './type';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { StreamingPreview } from '../streaming-preview';
import optionStyles from '../suffix-demo/index.module.scss';
import { COPY, FONT_FAMILY } from './consts';
import styles from './index.module.scss';

export const NativeDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [NativePreview, setNativePreview] = useState<ComponentType<NativePreviewProps> | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  const [pack, setPack] = useState<NativeDemoPack>('lite');
  const [effect, setEffect] = useState<NativeDemoEffect>('scale');
  const [sample, setSample] = useState<NativeDemoSample>('paragraph');
  const [smooth, setSmooth] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const source = labels.samples[sample].source;
  const stream = useDemoStream(source);
  const text = cursor === null ? stream.text : source.slice(0, cursor);
  const visualEffect: StreamingConfig['effect'] =
    effect === 'none'
      ? false
      : effect === 'cursor' || effect === 'dot'
        ? ['suffix', { type: effect }]
        : effect === 'combined'
          ? ['scale', ['suffix', { type: 'dot' }]]
          : effect;
  const config: boolean | StreamingConfig =
    streaming && !stream.reducedMotion
      ? { smooth, repairEnding: true, effect: visualEffect }
      : false;
  const WebComponent = pack === 'full' ? Fluxdown : FluxdownLite;
  const webProps = {
    build: { tex: true },
    streaming: config,
    text,
    theme: getDemoTheme(dark),
    style: { fontFamily: FONT_FAMILY, fontSize: 16, lineHeight: 1.65 },
  };

  useEffect(() => {
    let active = true;
    // Do not execute the native preview during the documentation's server rendering.
    void import('./preview')
      .then(({ NativePreview: Preview }) => {
        if (active) setNativePreview(() => Preview);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const replay = () => {
    setCursor(null);
    setStreaming(true);
    stream.replay();
  };

  return (
    <div
      className={`${styles.comparison} ${optionStyles.suffix}`}
      data-demo="native"
      ref={stream.containerRef}
    >
      <StreamingFrame
        caption={labels.caption}
        controls={{
          ...stream,
          playing: cursor === null && stream.playing,
          toggle: () => {
            setCursor(null);
            stream.toggle();
          },
          replay,
        }}
        label={labels.label}
      >
        <div className={optionStyles.options}>
          <label className={optionStyles.field}>
            {labels.pack}
            <span className={optionStyles.select}>
              <select
                aria-label={labels.pack}
                value={pack}
                onChange={(event) => setPack(event.target.value as NativeDemoPack)}
              >
                <option value="full">Full</option>
                <option value="lite">Lite</option>
                <option value="raw">Raw + Lite plugins</option>
              </select>
            </span>
          </label>
          <label className={optionStyles.field}>
            {labels.effect}
            <span className={optionStyles.select}>
              <select
                aria-label={labels.effect}
                value={effect}
                onChange={(event) => setEffect(event.target.value as NativeDemoEffect)}
              >
                {Object.entries(labels.effects).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className={optionStyles.field}>
            {labels.sample}
            <span className={optionStyles.select}>
              <select
                aria-label={labels.sample}
                value={sample}
                onChange={(event) => {
                  setCursor(null);
                  setSample(event.target.value as NativeDemoSample);
                }}
              >
                {Object.entries(labels.samples).map(([value, item]) => (
                  <option key={value} value={value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        <div className={optionStyles.custom}>
          <label>
            <input
              aria-label={labels.smooth}
              checked={smooth}
              onChange={(event) => setSmooth(event.target.checked)}
              type="checkbox"
            />
            {labels.smooth}
          </label>
          <label>
            <input
              aria-label={labels.streaming}
              checked={streaming}
              onChange={(event) => setStreaming(event.target.checked)}
              type="checkbox"
            />
            {labels.streaming}
          </label>
          <label className={styles.position}>
            {labels.position}
            <input
              aria-label={labels.position}
              className={styles.position}
              max={source.length}
              min={0}
              onChange={(event) => {
                if (stream.playing) stream.toggle();
                setCursor(Number(event.target.value));
              }}
              type="range"
              value={text.length}
            />
          </label>
        </div>
        <div className={styles.columns} data-native-comparison="true">
          <div data-renderer="react">
            <h3 className={styles.label}>React</h3>
            <StreamingPreview label="React" reducedMotion={stream.reducedMotion}>
              {pack === 'raw' ? (
                <FluxdownRaw key={stream.cycle} {...webProps} plugins={PRESET_LIGHT_PLUGINS} />
              ) : (
                <WebComponent key={stream.cycle} {...webProps} />
              )}
            </StreamingPreview>
          </div>
          <div data-renderer="native">
            <h3 className={styles.label}>React Native Web</h3>
            {NativePreview ? (
              <StreamingPreview label="React Native Web" reducedMotion={stream.reducedMotion}>
                <NativePreview
                  key={stream.cycle}
                  dark={dark}
                  pack={pack}
                  streaming={config}
                  text={text}
                />
              </StreamingPreview>
            ) : (
              <output className={styles.placeholder}>
                {failed ? labels.error : labels.loading}
              </output>
            )}
          </div>
        </div>
      </StreamingFrame>
    </div>
  );
};
