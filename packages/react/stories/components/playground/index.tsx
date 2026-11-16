import type { PlaygroundProps } from './type';

import { StreamingLabControls, StreamingLabInspector, useStreamingLab } from '../streaming-lab';
import { TrackedPreview } from '../tracked-preview';
import { Button, Panel, PanelActions, PanelGroup, Slider, Switch } from '../ui';
import { usePlayground } from './hooks/use-playground';
import './style.scss';

export type { PlaygroundProps } from './type';

export const Playground = ({ actions, patches, ...props }: PlaygroundProps) => {
  const lab = useStreamingLab();

  const {
    chunkSize,
    complete,
    config,
    cursor,
    handleBackToEditor,
    handlePause,
    handlePlay,
    handleProgress,
    handleReplay,
    handleResetSettings,
    handleResetText,
    handleSetting,
    handleStepBackward,
    handleStepForward,
    playbackMode,
    playbackText,
    previewText,
    progress,
    setChunkSize,
    setSpeed,
    setText,
    speed,
    status,
    stopped,
    text,
  } = usePlayground(props, lab.settings.speed);

  // Each of these rewinds playback to the start, so the inspector starts a fresh record.
  const rewind = (action: () => void) => () => {
    lab.inspector.clear();

    action();
  };

  return (
    <main className="playground">
      <header className="playground-toolbar">
        <h1>Markdown playground</h1>

        <span
          aria-live="polite"
          className="playground-status"
          data-state={playbackMode && !stopped ? 'live' : undefined}
        >
          {status}
        </span>

        <div className="playground-actions">
          <Button onClick={handleResetSettings}>Reset settings</Button>

          <Button onClick={playbackMode ? rewind(handleResetText) : handleResetText}>
            Reset text
          </Button>

          {playbackMode ? (
            <Button onClick={handleBackToEditor} primary>
              Back to editor
            </Button>
          ) : (
            <Button disabled={text.length === 0} onClick={rewind(handlePlay)} primary>
              Play
            </Button>
          )}
        </div>
      </header>

      <div className="playground-body">
        <Panel label="Playground settings">
          <PanelGroup title="Compiler">
            <Switch
              checked={config.repair}
              label="Repair"
              onChange={(enabled) => handleSetting('repair', enabled)}
            />

            <Switch
              checked={config.repairEnding}
              label="Repair end"
              onChange={(enabled) => handleSetting('repairEnding', enabled)}
            />

            <Switch
              checked={config.footnote}
              label="Footnote"
              onChange={(enabled) => handleSetting('footnote', enabled)}
            />

            <Switch
              checked={config.tex}
              label="TeX"
              onChange={(enabled) => handleSetting('tex', enabled)}
            />
          </PanelGroup>

          {playbackMode ? (
            <>
              <PanelGroup title="Playback">
                <Slider
                  format={(value) => `${value}/s`}
                  label="Rate"
                  max={100}
                  min={1}
                  onChange={setSpeed}
                  step={1}
                  value={speed}
                />

                <Slider
                  format={(value) => `${value} ch`}
                  label="Chunk size"
                  max={20}
                  min={1}
                  onChange={setChunkSize}
                  step={1}
                  value={chunkSize}
                />

                <Slider
                  format={(value) => `${Math.round(value)}%`}
                  label="Progress"
                  max={100}
                  min={0}
                  onChange={handleProgress}
                  step={1}
                  value={progress}
                />

                <PanelActions>
                  <Button disabled={cursor === 0} onClick={handleStepBackward}>
                    Step back
                  </Button>

                  <Button disabled={complete} onClick={handleStepForward}>
                    Step forward
                  </Button>

                  <Button disabled={complete} onClick={handlePause}>
                    {stopped ? 'Resume' : 'Pause'}
                  </Button>

                  <Button disabled={playbackText.length === 0} onClick={rewind(handleReplay)}>
                    Replay
                  </Button>
                </PanelActions>
              </PanelGroup>

              <StreamingLabControls lab={lab} />

              <StreamingLabInspector lab={lab} />
            </>
          ) : null}
        </Panel>

        <div className="playground-workspace">
          <section aria-label="Markdown editor" className="playground-pane">
            <div className="playground-pane-heading">
              <h2>Source</h2>

              <span className="playground-meta">
                {playbackMode ? `${cursor}/${playbackText.length}` : `${text.length} chars`}
              </span>
            </div>

            {playbackMode ? (
              <pre aria-label="Markdown playback" className="playground-source">
                <span>{playbackText.slice(0, cursor)}</span>
                <span className="playground-unplayed">{playbackText.slice(cursor)}</span>
              </pre>
            ) : (
              <textarea
                aria-label="Markdown"
                className="playground-source"
                onChange={(event) => setText(event.currentTarget.value)}
                spellCheck={false}
                value={text}
              />
            )}
          </section>

          <TrackedPreview
            actions={actions}
            ariaLabel={playbackMode ? 'Playback preview' : 'Preview'}
            config={config}
            patches={patches}
            streaming={playbackMode ? lab.streaming : undefined}
            text={previewText}
          />
        </div>
      </div>
    </main>
  );
};
