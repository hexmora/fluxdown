/* oxlint-disable jsx-a11y/prefer-tag-over-role -- This inline SVG is an animated chart with an accessible description. */

import { Fluxdown } from 'fluxdown';
import { useId } from 'react';

import { useLocale } from '../../../hooks';
import { ReplayIcon } from '../../../icons';
import { COPY } from './consts';
import { useCurvePlayback } from './hooks';
import styles from './index.module.scss';
import { ARRIVALS, DURATION, TOTAL, TRACE } from './trace';

const LEFT = 44;
const TOP = 30;
const WIDTH = 570;
const HEIGHT = 210;
const x = (time: number) => LEFT + (time / DURATION) * WIDTH;
const y = (value: number) => TOP + HEIGHT - (value / TOTAL) * HEIGHT;
const visiblePath = TRACE.map(
  ({ time, visible }, index) =>
    `${index ? 'L' : 'M'}${x(time).toFixed(2)},${y(visible).toFixed(2)}`,
).join(' ');
const receivedPath = [
  `M${x(0)},${y(0)}`,
  ...ARRIVALS.map(({ time, total }) => `H${x(time)}V${y(total)}`),
  `H${x(DURATION)}`,
].join(' ');

export const SpringEquation = () => {
  return (
    <div className={styles.equation} data-demo="spring-equation">
      <Fluxdown
        build={{ tex: true }}
        text={String.raw`$$F = k(r - x) - c\,v, \qquad a = \frac{F}{m}$$`}
        theme={{ tokens: { colors: { bg: 'transparent', fg: 'var(--site-ink)' } } }}
      />
    </div>
  );
};

export const SpringCurve = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const { containerRef, time, replay } = useCurvePlayback();
  const clipId = useId();
  const sample = TRACE[Math.min(Math.floor(time / 20), TRACE.length - 1)];

  return (
    <div className={styles.demo} data-demo="spring-curve" ref={containerRef}>
      <div className={styles.toolbar}>
        <div className={styles.legend}>
          <span className={styles.received}>{labels.received}</span>
          <span className={styles.visible}>{labels.visible}</span>
        </div>
        <button aria-label={labels.replay} onClick={replay} type="button">
          <ReplayIcon />
          {labels.replay}
        </button>
      </div>
      <svg
        role="img"
        aria-label={labels.label}
        viewBox="0 0 640 290"
        data-time={Math.round(time)}
        data-received={sample.received}
        data-visible={sample.visible}
      >
        <desc>{labels.description}</desc>
        <defs>
          <clipPath id={clipId}>
            <rect x={LEFT - 2} y={TOP - 6} width={x(time) - LEFT + 4} height={HEIGHT + 12} />
          </clipPath>
        </defs>
        {[0, 55, 110, 165, 220].map((value) => (
          <g key={value} className={styles.grid}>
            <line x1={LEFT} x2={LEFT + WIDTH} y1={y(value)} y2={y(value)} />
            <text x={LEFT - 10} y={y(value) + 4} textAnchor="end">
              {value}
            </text>
          </g>
        ))}
        {[0, 2, 4, 6].map((seconds) => (
          <text
            className={styles.axis}
            key={seconds}
            x={x(seconds * 1000)}
            y={HEIGHT + TOP + 20}
            textAnchor="middle"
          >
            {seconds}
          </text>
        ))}
        <text className={styles.axis} x={LEFT} y={16}>
          {labels.units}
        </text>
        <text className={styles.axis} x={LEFT + WIDTH} y={280} textAnchor="end">
          {labels.seconds}
        </text>
        <g clipPath={`url(#${clipId})`}>
          <path className={styles.targetLine} d={receivedPath} />
          <path className={styles.visibleLine} d={visiblePath} />
        </g>
        <circle className={styles.targetDot} cx={x(time)} cy={y(sample.received)} r={3} />
        <circle className={styles.visibleDot} cx={x(time)} cy={y(sample.visible)} r={4} />
      </svg>
    </div>
  );
};
