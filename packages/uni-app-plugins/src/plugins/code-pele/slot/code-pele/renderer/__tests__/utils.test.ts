import { DARK_THEME } from '../../../../../../base/theme/presets/dark';
import { LIGHT_THEME } from '../../../../../../base/theme/presets/light';
import { renderDiagram, toDiagramImage } from '../utils';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders a readable SVG diagram without DOM or canvas APIs', async () => {
  vi.stubGlobal('document', undefined);

  vi.stubGlobal('window', undefined);

  const diagram = await renderDiagram(
    'flowchart LR\n A[Markdown] --> B[原生渲染]',
    'native-diagram',
  );

  const image = toDiagramImage(diagram, LIGHT_THEME.tokens);

  expect(image?.width).toBeGreaterThan(0);

  expect(image?.height).toBeGreaterThan(0);

  const svg = decodeURIComponent(image!.src.split(',').slice(1).join(','));

  expect(svg).toContain('Markdown');

  expect(svg).toContain('原生渲染');

  expect(svg).toContain(LIGHT_THEME.tokens.colors.fg);

  expect(svg).not.toContain('var(');

  expect(svg).not.toContain('currentColor');

  expect(svg).not.toContain('foreignObject');
});

test('resolves inherited and local variables without leaking local colors to siblings', () => {
  const diagram = {
    width: 100,
    height: 40,
    svg: '<svg viewBox="0 0 100 40" style="--ink:var(--pele-fg);color:var(--ink)"><defs><clipPath id="clip"><rect width="100" height="40"/></clipPath></defs><g style="--ink:#ff0000;color:var(--ink)"><text fill="currentColor">red</text></g><text fill="currentColor">inherited</text><path clip-path="url(#clip)" fill="var(--ink)"/></svg>',
  };

  const image = toDiagramImage(diagram, DARK_THEME.tokens)!;

  const svg = decodeURIComponent(image.src.split(',').slice(1).join(','));

  expect(svg).toContain('<clipPath');

  expect(svg).toContain('fill="#ff0000">red');

  expect(svg).toContain(`fill="${DARK_THEME.tokens.colors.fg}">inherited`);

  expect(svg).not.toContain('var(');

  expect(svg).not.toContain('currentColor');
});

test('retains safe source fallback for unsupported markup and incomplete input', async () => {
  await expect(renderDiagram('flowchart LR\n A -->', 'incomplete')).rejects.toThrow();

  expect(
    toDiagramImage(
      { svg: '<svg><foreignObject>HTML</foreignObject></svg>', width: 1, height: 1 },
      LIGHT_THEME.tokens,
    ),
  ).toBeNull();

  expect(toDiagramImage({ svg: '<svg/>', width: 0, height: 1 }, LIGHT_THEME.tokens)).toBeNull();
});
