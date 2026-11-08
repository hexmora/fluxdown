import type { IReactiveState } from 'stative';

import { useEffect, useRef, useState } from 'react';

import type { PipelineSnapshot } from './type';

import { createPipeline } from './runtime';

const EMPTY: PipelineSnapshot = { sections: [], compiled: [], mapped: [], rendered: [] };

const observeList = <T, R>(
  source: IReactiveState<T[]>,
  read: (item: T) => { key: string; state: IReactiveState<R> },
  publish: (items: { key: string; value: R }[]) => void,
) => {
  let current: { key: string; state: IReactiveState<R> }[] = [];
  let subscriptions: { unsubscribe(): void }[] = [];
  let queued = false;
  let closed = false;

  const update = () => {
    if (queued || closed) {
      return;
    }

    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (!closed) {
        publish(current.map(({ key, state }) => ({ key, value: state.value })));
      }
    });
  };

  const list = source.subscribe((items) => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    current = items.map(read);
    subscriptions = current.map(({ state }) => state.subscribe(update));
    update();
  });

  return () => {
    closed = true;
    list.unsubscribe();
    subscriptions.forEach((subscription) => subscription.unsubscribe());
  };
};

export const usePipeline = (text: string, smooth: boolean) => {
  const pipeline = useRef<ReturnType<typeof createPipeline> | null>(null);
  const [snapshot, setSnapshot] = useState(EMPTY);

  useEffect(() => {
    const current = createPipeline(smooth);
    pipeline.current = current;
    setSnapshot(EMPTY);

    const sections = current.sections.value.subscribe((items) =>
      setSnapshot((previous) => ({ ...previous, sections: items.map((item) => item.text) })),
    );
    const compiled = observeList(
      current.compiled.value,
      (block) => ({ key: block.meta.value.key, state: block.value }),
      (items) =>
        setSnapshot((previous) => ({
          ...previous,
          compiled: items.map(({ key, value }) => ({ key, tree: value })),
        })),
    );
    const mapped = observeList(
      current.mapped.value,
      (block) => ({ key: block.meta.value.key, state: block.value }),
      (items) =>
        setSnapshot((previous) => ({
          ...previous,
          mapped: items.map(({ key, value }) => ({ key, tree: value })),
        })),
    );
    const rendered = observeList(
      current.rendered.value,
      (item) => ({ key: item.key, state: item.content.value }),
      (items) =>
        setSnapshot((previous) => ({
          ...previous,
          rendered: items.map(({ key, value }) => ({ key, content: value })),
        })),
    );

    return () => {
      sections.unsubscribe();
      compiled();
      mapped();
      rendered();
      current.destroy();
      pipeline.current = null;
    };
  }, [smooth]);

  useEffect(() => {
    pipeline.current?.text.next(text);
  }, [text, smooth]);

  return snapshot;
};
