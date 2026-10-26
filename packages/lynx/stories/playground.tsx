import { Fluxdown } from '@fluxdown/lynx';
import { FluxdownLite } from '@fluxdown/lynx/lite';
import { root, useEffect, useInitData, useState } from '@lynx-js/react';

import type { PlaygroundArgs } from './consts';

import { STORY_MARKDOWN } from './consts';
import './playground.css';

function Playground() {
  const args = useInitData() as Partial<PlaygroundArgs>;

  const text = args.text ?? STORY_MARKDOWN;

  const [length, setLength] = useState(0);

  const [running, setRunning] = useState(true);

  useEffect(() => {
    setLength(0);

    setRunning(true);
  }, [text, args.streaming]);

  useEffect(() => {
    if (!args.streaming || !running || length >= text.length) return;

    const timer = setTimeout(() => setLength((value) => Math.min(value + 12, text.length)), 32);

    return () => clearTimeout(timer);
  }, [args.streaming, running, length, text]);

  const Renderer = args.pack === 'lite' ? FluxdownLite : Fluxdown;

  const source = args.streaming ? text.slice(0, length) : text;

  return (
    <view className="playground">
      <view className="playground-toolbar">
        <text className="playground-title">Fluxdown · Lynx</text>
        <text>
          {source.length} / {text.length} characters
        </text>
        {args.streaming && (
          <view className="playground-button" bindtap={() => setRunning((value) => !value)}>
            <text>{running ? 'Pause' : 'Continue'}</text>
          </view>
        )}
        <view
          className="playground-button"
          bindtap={() => {
            setLength(0);

            setRunning(true);
          }}
        >
          <text>Replay</text>
        </view>
      </view>
      <scroll-view className="playground-scroll" scroll-y>
        <view
          className="playground-content"
          style={{ backgroundColor: args.theme === 'dark' ? '#09090b' : '#ffffff' }}
        >
          <Renderer
            text={source}
            theme={args.theme}
            streaming={
              args.streaming && length < text.length
                ? {
                    smooth: args.smooth ?? true,
                    effect: args.effect === 'none' ? false : (args.effect ?? 'scale'),
                  }
                : false
            }
          />
        </view>
      </scroll-view>
    </view>
  );
}

root.render(<Playground />);
