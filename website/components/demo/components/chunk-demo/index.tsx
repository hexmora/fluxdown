import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { StreamingPreview } from '../streaming-preview';
import { COPY, TIMING } from './consts';

export const ChunkDemo = () => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const stream = useDemoStream(labels.source, TIMING);

  return (
    <div data-demo="chunk" ref={stream.containerRef}>
      <StreamingFrame caption={labels.caption} controls={stream} label={labels.label}>
        <StreamingPreview label={labels.label} reducedMotion={stream.reducedMotion}>
          <Fluxdown
            key={stream.cycle}
            streaming={stream.reducedMotion ? false : { smooth: false, effect: 'chunk' }}
            text={stream.text}
            theme={getDemoTheme(dark)}
          />
        </StreamingPreview>
      </StreamingFrame>
    </div>
  );
};
