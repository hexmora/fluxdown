import type { ReactNode } from 'react';

import { useId } from 'react';

import { useLocale } from '../../../hooks';
import { COPY } from './consts';
import styles from './index.module.scss';

const Flow = ({
  label,
  processor,
  before,
  after,
}: {
  label: string;
  processor: string;
  before: ReactNode;
  after: ReactNode;
}) => (
  <figure aria-label={label} className={`${styles.diagram} ${styles.flow}`}>
    {before}
    <div className={styles.arrow}>
      <small>{processor}</small>
      <span aria-hidden="true">→</span>
    </div>
    {after}
  </figure>
);

const Branch = ({ prefix, emphasis }: { prefix: string; emphasis: string }) => (
  <ul className={styles.tree}>
    <li>
      <span className={styles.tag}>p</span>
      <ul>
        <li>
          <span className={styles.text}>{prefix}</span>
        </li>
        <li>
          <span className={styles.tag}>strong</span>
          <ul>
            <li>
              <span className={styles.text}>{emphasis}</span>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
);

export const ChunkingDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const blocks = [`# ${labels.title}`, labels.sentence, labels.list];

  return (
    <Flow
      label={labels.chunk}
      processor="TextChunker"
      before={
        <div className={styles.card}>
          <div className={styles.label}>{labels.input}</div>
          <div className={styles.lines}>
            {blocks.map((text, index) => (
              <div data-tone={index} key={text}>
                {text}
              </div>
            ))}
          </div>
        </div>
      }
      after={
        <div className={styles.card}>
          <div className={styles.label}>{labels.blocks}</div>
          <ol className={styles.blocks}>
            {blocks.map((text, index) => (
              <li data-tone={index} key={text}>
                <span>{index + 1}</span>
                <div>{text}</div>
              </li>
            ))}
          </ol>
        </div>
      }
    />
  );
};

export const BuildingDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <Flow
      label={labels.build}
      processor="BlockCompiler"
      before={
        <div className={styles.card}>
          <div className={styles.label}>{labels.markdown}</div>
          <div className={styles.source}>{labels.unfinished}</div>
        </div>
      }
      after={
        <div className={styles.card}>
          <div className={styles.label}>{labels.tree}</div>
          <Branch prefix={labels.prefix} emphasis={labels.emphasis} />
        </div>
      }
    />
  );
};

export const MappingDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <Flow
      label={labels.map}
      processor="MapperComposer"
      before={
        <div className={styles.card}>
          <div className={styles.label}>{labels.received}</div>
          <div className={styles.units}>
            {labels.units.map((unit) => (
              <span key={unit}>{unit}</span>
            ))}
          </div>
        </div>
      }
      after={
        <div className={styles.card}>
          <div className={styles.label}>{labels.visible}</div>
          <div className={styles.units}>
            {labels.units.map((unit, index) => (
              <span key={unit} data-pending={index > 2}>
                {unit}
              </span>
            ))}
          </div>
          <div className={styles.track}>
            <span style={{ width: `${300 / labels.units.length}%` }} />
          </div>
        </div>
      }
    />
  );
};

export const RenderingDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <Flow
      label={labels.render}
      processor="Renderer"
      before={
        <div className={styles.card}>
          <div className={styles.label}>{labels.tree}</div>
          <Branch prefix={labels.prefix} emphasis={labels.emphasis} />
        </div>
      }
      after={
        <div className={styles.card}>
          <div className={styles.label}>{labels.view}</div>
          <div className={styles.rendered}>
            {labels.prefix}
            <strong>{labels.emphasis}</strong>
          </div>
        </div>
      }
    />
  );
};

export const RendererBridgeDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <figure aria-label={labels.bridge} className={`${styles.diagram} ${styles.bridge}`}>
      <div className={styles.bridgeFlow}>
        <div className={styles.node}>
          <strong>{labels.application}</strong>
          <span>{labels.inputs}</span>
        </div>
        <span className={styles.connector} aria-hidden="true">
          →
        </span>
        <div className={styles.node}>
          <strong>Core</strong>
          <span>{labels.output}</span>
        </div>
        <span className={styles.connector} aria-hidden="true">
          →
        </span>
        <div className={`${styles.node} ${styles.adapter}`}>
          <strong>{labels.subscriptions}</strong>
          <span>{labels.listUpdates}</span>
          <span>{labels.blockUpdates}</span>
        </div>
        <span className={styles.connector} aria-hidden="true">
          →
        </span>
        <div className={styles.node}>
          <strong>{labels.components}</strong>
          <span>{labels.frameworks}</span>
        </div>
      </div>
      <div className={styles.cleanup}>
        <span>{labels.unmount}</span>
        <span aria-hidden="true">→</span>
        <span>{labels.release}</span>
      </div>
    </figure>
  );
};

export const StateClosureDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const arrowId = useId();

  return (
    <figure aria-label={labels.closures} className={`${styles.diagram} ${styles.closures}`}>
      <div className={styles.closureGraph}>
        <svg
          className={styles.graphEdges}
          viewBox="0 0 640 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 1 1 L 7 4 L 1 7" />
            </marker>
          </defs>
          <g markerEnd={`url(#${arrowId})`}>
            <path d="M 103 154 H 129" />
            <path d="M 238 154 C 251 154 251 84 263 84" />
            <path d="M 238 154 C 251 154 251 234 263 234" />
            <path d="M 392 84 C 405 84 405 154 417 154" />
            <path d="M 392 234 C 405 234 405 154 417 154" />
            <path d="M 472 68 V 124" />
            <path d="M 526 154 H 553" />
          </g>
        </svg>
        <div className={`${styles.graphNode} ${styles.graphInput}`}>
          <strong>text</strong>
          <span>{labels.external}</span>
        </div>
        <div className={`${styles.graphNode} ${styles.graphSplit}`}>
          <strong>{labels.split}</strong>
          <code>TextChunker</code>
        </div>
        <div className={styles.graphGroup}>BlockCompiler</div>
        <div className={`${styles.graphNode} ${styles.graphFirst}`} data-tone="0">
          <strong>{labels.first}</strong>
          <code>CompiledBlockContent</code>
          <span>{labels.blockState}</span>
        </div>
        <div className={`${styles.graphNode} ${styles.graphSecond}`} data-tone="1">
          <strong>{labels.second}</strong>
          <code>CompiledBlockContent</code>
          <span>{labels.blockState}</span>
        </div>
        <div className={`${styles.graphNode} ${styles.graphProgress}`}>
          <strong>{labels.progress}</strong>
          <code>SmoothCursor</code>
        </div>
        <div className={`${styles.graphNode} ${styles.graphMapping}`}>
          <strong>{labels.mapping}</strong>
          <code>MapperComposer</code>
        </div>
        <div className={`${styles.graphNode} ${styles.graphOutput}`}>
          <strong>{labels.result}</strong>
          <code>Renderer</code>
        </div>
      </div>
    </figure>
  );
};
