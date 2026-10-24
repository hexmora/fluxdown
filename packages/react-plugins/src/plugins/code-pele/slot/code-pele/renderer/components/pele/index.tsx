import type { RenderOptions } from 'pele';

import cn from 'classnames';
import { renderAsync } from 'pele/lazy';
import { useEffect, useId, useState } from 'react';

import type { CodeBlockProps } from '../../../../../../../base';

import { createTypeOfSlot } from '../../../../../../../base';
import styles from './index.module.scss';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const DIAGRAM_OPTIONS: RenderOptions = {
  fontSize: 14,
  images: false,
  links: false,
  measurer: {
    // Conservative character widths keep layout independent of DOM, canvas, and loaded fonts.
    width(text, size, style) {
      let width = 0;

      for (const char of text) {
        width += char.charCodeAt(0) > 255 || /[MWmw@#%&]/.test(char) ? 1 : 0.75;
      }

      return width * size * (style & 1 ? 1.05 : 1);
    },
  },
};

const PeleRenderer = ({ Raw, ...props }: CodeBlockProps) => {
  const {
    className,
    code,
    language,
    loading,
    meta,
    onCopy,
    showHeader = true,
    suffix,
    ...elementProps
  } = props;

  const idPrefix = useId();
  const [diagram, setDiagram] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (code.trim()) {
      void renderAsync(code, {
        ...DIAGRAM_OPTIONS,
        idPrefix,
      }).then(
        ({ svg }) => {
          if (active) {
            setDiagram(svg);
          }
        },
        () => {
          // Keep the last valid diagram while streamed syntax is incomplete.
        },
      );
    } else {
      setDiagram(null);
    }

    return () => {
      active = false;
    };
  }, [code, idPrefix]);

  if (!diagram) {
    return Raw && <Raw {...props} />;
  }

  return (
    <div {...elementProps} className={cn(styles.root, className)} aria-busy={loading || undefined}>
      {showHeader ? (
        <CodeHeader code={code} language={language} meta={meta} onCopy={onCopy} />
      ) : null}
      <figure
        className={styles.canvas}
        aria-label={meta || 'Diagram'}
        dangerouslySetInnerHTML={{ __html: diagram }}
      />
      {suffix}
    </div>
  );
};

export default PeleRenderer;
