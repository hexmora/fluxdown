import { Image, Text, View } from '@tarojs/components';
import cn from 'classnames';
import { useMemo, useState } from 'react';

import type { TexProps } from '../../../../../../../base';

import { useTextColor } from '../../../../../../../base';
import styles from '../../index.module.scss';
import { texToSvg } from './utils';

export const MathjaxTexRenderer = (props: TexProps) => {
  const { className, mode = 'inline', style, tex } = props;

  const textColor = useTextColor();

  const color = style?.color ?? textColor;

  const svg = useMemo(() => texToSvg(tex, mode, color), [tex, mode, color]);

  const [failedSource, setFailedSource] = useState<string>();

  const failed = svg === null || svg.src === failedSource;

  const Root = mode === 'display' ? View : Text;

  return (
    <Root
      className={cn(styles.root, className)}
      data-formula-error={failed || undefined}
      data-mode={mode}
      data-tex={tex}
      style={style}
    >
      {failed ? (
        tex
      ) : (
        <Image
          aria-label={tex}
          className={styles.image}
          mode="aspectFit"
          onError={() => setFailedSource(svg.src)}
          onLoad={() => setFailedSource(undefined)}
          src={svg.src}
          style={{
            width: svg.width,
            height: svg.height,
            minWidth: svg.minWidth,
            verticalAlign: svg.baseline,
          }}
        />
      )}
    </Root>
  );
};

export default MathjaxTexRenderer;
