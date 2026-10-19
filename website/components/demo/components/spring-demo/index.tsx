import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { StreamingFrame } from '../streaming-frame';
import { COPY } from './consts';
import { useSpringCursor } from './hooks';
import styles from './index.module.scss';

export const SpringDemo = () => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const stream = useDemoStream(labels.source);

  const cursor = useSpringCursor({ ...stream, source: labels.source });

  const complete = cursor >= labels.source.length;

  return (
    <div className={styles.spring} ref={stream.containerRef}>
      <StreamingFrame
        caption={
          <div className={styles.legend}>
            <span>{labels.visible}</span>
            <span className={styles.buffered}>{labels.buffered}</span>
          </div>
        }
        controls={{ ...stream, complete, playing: stream.active && !complete }}
        label={labels.label}
      >
        <div aria-label={labels.source} className={styles.text}>
          <span aria-hidden="true">{stream.text.slice(0, cursor)}</span>
          <span aria-hidden="true" className={styles.buffered}>
            {stream.text.slice(cursor)}
          </span>
          <span aria-hidden="true" className={styles.pending}>
            {labels.source.slice(stream.text.length)}
          </span>
        </div>
        <div aria-hidden="true" className={styles.progress}>
          <span style={{ width: `${(cursor / labels.source.length) * 100}%` }} />
          <span
            className={styles.buffered}
            style={{ width: `${((stream.text.length - cursor) / labels.source.length) * 100}%` }}
          />
        </div>
      </StreamingFrame>
    </div>
  );
};
