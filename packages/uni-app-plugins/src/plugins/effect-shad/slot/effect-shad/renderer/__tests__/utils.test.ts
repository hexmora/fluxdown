import type {
  UniComponentNode,
  UniRenderNode,
  UniSlotNode,
} from '../../../../../../typings/render';

import { toShadWords } from '../components/text/utils';
import { shadeNodes } from '../utils';

describe('shad inline preservation', () => {
  test('keeps custom slot identity and props while shading text leaves', () => {
    const props = { class: 'custom-strong' };

    const source: UniSlotNode = { type: 'Strong', props, children: ['tail'] };

    const [shaded] = shadeNodes(source, '!', 0);

    expect(shaded).toMatchObject({ type: 'Strong', props });

    expect(
      shaded &&
        !Array.isArray(shaded) &&
        typeof shaded === 'object' &&
        'type' in shaded &&
        shaded.props,
    ).toBe(props);

    expect(source.children).toEqual(['tail']);

    expect(shaded).toMatchObject({
      children: [{ props: { text: 'tail', trailingText: '!', maskText: '!' } }],
    });
  });

  test('limits canvas drawing to the tail and retains word order', () => {
    const words = toShadWords('a long leading sentence ends here', '', 24, 0);

    expect(
      words
        .map((word) => word.text)
        .join('')
        .replace(/\u00a0/g, ' '),
    ).toBe('a long leading sentence ends here');

    expect(words[0].trailing).toBeUndefined();

    expect(words.at(-1)).toEqual({ key: 'shad-29', text: 'here', trailing: '' });
  });

  test('merges leading and active text without crossing styled or component boundaries', () => {
    const strong: UniSlotNode = { type: 'Strong', props: {}, children: ['bo', ['ld']] };

    const component: UniComponentNode = { component: {}, props: { text: 'custom' } };

    const leading: UniRenderNode[] = ['before ', strong, ' wo'];

    const active: UniRenderNode[] = [['r', null, 'ld'], component, [3, '!']];

    const result = shadeNodes(leading, active, 0);

    expect(result).toMatchObject([
      { props: { text: 'before ', trailingText: 'bold world3!' } },
      {
        type: 'Strong',
        children: [{ props: { text: 'bold', trailingText: ' world3!' } }],
      },
      { props: { text: ' world', trailingText: '3!' } },
      component,
      { props: { text: '3!', trailingText: '' } },
    ]);

    expect(result[3]).toBe(component);

    expect(strong.children).toEqual(['bo', ['ld']]);
  });

  test('keeps source word keys as the shad tail advances and grows', () => {
    const before = toShadWords('Streaming te', '', 10, 0);

    const after = toShadWords('text sta', '', 4, 10);

    expect(before.at(-1)).toMatchObject({ key: 'shad-10', text: 'te' });

    expect(after[0]).toMatchObject({ key: 'shad-10', text: 'text\u00a0' });

    expect(after[1]).toMatchObject({ key: 'shad-15', text: 'sta' });

    expect(shadeNodes('', 'text sta', 10)[0]).toMatchObject({ props: { offset: 10 } });
  });

  test('shades the full active range and counts grapheme positions for keys', () => {
    const [node] = shadeNodes('A', '🙂BCDEF', 7);

    expect(node).toMatchObject({
      props: { text: 'A🙂BCDEF', maskText: '🙂BCDEF', prefix: 1, offset: 7 },
    });

    const words = toShadWords('🙂 hi there', '', 0, 7);

    expect(words.map((word) => word.key)).toEqual(['shad-7', 'shad-9', 'shad-12']);

    expect(words.every((word) => word.trailing !== undefined)).toBe(true);
  });
});
