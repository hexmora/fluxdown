import type { Element } from 'hast';

import { getVueProps, isSafeTagName, styleStringToObject } from '../hast';

const element = (properties: Element['properties']): Element => {
  return { type: 'element', tagName: 'div', properties, children: [] };
};

describe('HAST attributes', () => {
  test('maps classes, data attributes and inline CSS to Vue props', () => {
    expect(
      getVueProps(
        element({
          className: ['one', 'two'],
          dataActive: true,
          ariaLabel: 'message',
          style: 'font-weight: bold; color: red; --token: 2',
        }),
      ),
    ).toEqual({
      class: 'one two',
      'data-active': true,
      'aria-label': 'message',
      style: { fontWeight: 'bold', color: 'red', '--token': '2' },
    });
  });

  test('does not forward event handlers or renderer escape hatches', () => {
    expect(
      getVueProps(
        element({
          onclick: 'alert(1)',
          onClick: 'alert(1)',
          innerHTML: '<script>bad</script>',
          dangerouslySetInnerHTML: 'bad',
          children: 'bad',
          key: 'bad',
          ref: 'bad',
          title: 'safe',
        }),
      ),
    ).toEqual({ title: 'safe' });
  });

  test('keeps quoted and parenthesized CSS declarations intact', () => {
    expect(styleStringToObject('background: url("a;b"); content: "x;y"; color: blue')).toEqual({
      background: 'url("a;b")',
      content: '"x;y"',
      color: 'blue',
    });
  });

  test.each(['script', 'style', 'iframe', 'svg', 'object', 'a onclick=x'])(
    'rejects unsafe %s tags',
    (tag) => {
      expect(isSafeTagName(tag)).toBe(false);
    },
  );
});
