import { Button, View } from '@tarojs/components';
import { useEffect, useState } from 'react';

import type { StreamingPreviewProps } from './type';

import { Fluxdown } from '../../../src/packs/full';

export const StreamingPreview = ({ text, effect, ...props }: StreamingPreviewProps) => {
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (length >= text.length) {
      return;
    }

    const timer = setTimeout(() => {
      setLength((value) => Math.min(value + 8, text.length));
    }, 80);

    return () => clearTimeout(timer);
  }, [length, text.length]);

  return (
    <View>
      <Button onClick={() => setLength(0)}>Replay</Button>
      <Fluxdown
        {...props}
        text={text.slice(0, length)}
        streaming={{ effect, smooth: effect !== 'chunk', repairEnding: length < text.length }}
      />
    </View>
  );
};
