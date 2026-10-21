import { FallbackPlugin } from '@fluxdown/react-native-presets/plugins/fallback';
import { ParagraphPlugin } from '@fluxdown/react-native-presets/plugins/paragraph';
import { StrongPlugin } from '@fluxdown/react-native-presets/plugins/strong';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';
import { expectNativeTextContainers, textContent } from './utils/native';

describe('native package entrypoints', () => {
  test.each([Fluxdown, FluxdownLite])('renders Markdown with the preset component', (Component) => {
    const view = render(<Component text={'# Heading\n\nHello **native**.'} />);

    expect(textContent(view.toJSON())).toBe('HeadingHello native.');
    expectNativeTextContainers(view.toJSON());
  });

  test('assembles raw rendering from individually imported plugins', () => {
    const view = render(
      <FluxdownRaw
        text="Hello **native**."
        plugins={[ParagraphPlugin, StrongPlugin, FallbackPlugin]}
      />,
    );

    expect(textContent(view.toJSON())).toBe('Hello native.');
    expectNativeTextContainers(view.toJSON());
  });

  test('keeps lite TeX and code usable without highlighter or math engine', () => {
    const view = render(
      <FluxdownLite build={{ tex: true }} text={'$x^2$\n\n```js\nconst answer = 42;\n```'} />,
    );

    expect(textContent(view.toJSON())).toContain('x^2');
    expect(textContent(view.toJSON())).toContain('const answer = 42;');
    expectNativeTextContainers(view.toJSON());
  });

  test('updates native styles and selection through every memoized pack', () => {
    const view = render(<FluxdownLite text="same" selectable={false} />);

    view.rerender(<FluxdownLite text="same" selectable styles={{ paragraph: { fontSize: 24 } }} />);

    const paragraph = view.UNSAFE_getAllByType(Text).find((node) => node.props.selectable);
    expect(paragraph).toBeTruthy();
    expect(paragraph?.props.style).toContainEqual({ fontSize: 24 });
  });
});
