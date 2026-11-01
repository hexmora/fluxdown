import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';

import type { AnimationDemoProps } from './type';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { StreamingPreview } from '../streaming-preview';
import { COPY } from './consts';

export const AnimationDemo = ({ effect }: AnimationDemoProps) => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const stream = useDemoStream(labels.source);

  return (
    <div data-demo={effect} ref={stream.containerRef}>
      <StreamingFrame caption={labels[effect]} controls={stream} label={labels[effect]}>
        <StreamingPreview
          playing={stream.playing}
          label={labels[effect]}
          reducedMotion={stream.reducedMotion}
        >
          <Fluxdown
            key={stream.cycle}
            streaming={stream.reducedMotion ? false : { smooth: true, repairEnding: true, effect }}
            text={stream.text}
            theme={getDemoTheme(dark)}
          />
        </StreamingPreview>
      </StreamingFrame>
    </div>
  );
};
