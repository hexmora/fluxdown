/** @jest-environment node */

import { LIGHT_THEME } from '../../../../../base/theme/presets';
import { renderDiagram } from '../renderer/components/mermaid/utils';

describe('native Mermaid diagrams', () => {
  test.each([
    'flowchart LR\nA[Start] --> B[Done]',
    'sequenceDiagram\nAlice->>Bob: Hello',
    'pie title Distribution\n"A" : 40\n"B" : 60',
  ])('renders %s without DOM or Skia globals', async (source) => {
    const diagram = await renderDiagram(source, LIGHT_THEME.tokens, 'native');

    expect(diagram?.svg).toMatch(/^<svg /);

    expect(diagram?.svg).not.toContain('<foreignObject');

    expect(diagram?.width).toBeGreaterThan(0);

    expect(diagram?.height).toBeGreaterThan(0);
  });

  test('returns no diagram for unsupported source', async () => {
    expect(await renderDiagram('not a diagram', LIGHT_THEME.tokens, 'native')).toBeNull();
  });

  test('uses native theme colors in exported graphics', async () => {
    const diagram = await renderDiagram(
      'flowchart LR\nA-->B',
      {
        ...LIGHT_THEME.tokens,
        colors: { ...LIGHT_THEME.tokens.colors, bg: '#123456', fg: '#abcdef' },
      },
      'native',
    );

    expect(diagram?.svg).toContain('#123456');

    expect(diagram?.svg).toContain('#abcdef');
  });
});
