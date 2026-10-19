import { useRendersCount, useUpdate } from 'react-use';

import type { TrackedPreviewProps } from './type';

import { useResolvedTheme } from '../../../.storybook/theme-addon';
import { Fluxdown } from '../../../src';

export const TrackedPreview = ({
  actions,
  ariaLabel,
  config,
  patches,
  text,
}: TrackedPreviewProps) => {
  const { repairEnding, ...build } = config;

  const renderCount = useRendersCount();

  const update = useUpdate();

  const theme = useResolvedTheme();

  return (
    <section aria-label={ariaLabel} className="playground-pane">
      <div className="playground-pane-heading">
        <h2>Preview</h2>

        <output
          aria-label="Preview render count"
          className="playground-render-count"
          key={renderCount}
        >
          {renderCount}
        </output>

        {actions}

        <button onClick={update} type="button">
          Re-render
        </button>
      </div>

      <div className="playground-preview-content">
        {text.length > 0 ? (
          <Fluxdown
            build={build}
            patches={patches}
            streaming={{ repairEnding, smooth: false }}
            text={text}
            theme={theme}
          />
        ) : null}
      </div>
    </section>
  );
};
