import type { Element } from 'hast';

import { render } from '@testing-library/react';

import { getTaroProps, isSafeTagName, styleStringToObject } from '../base';
import { ElementRenderer } from '../plugins/fallback/slot/element/renderer';
import { katexTexToHtml } from '../plugins/tex-katex/slot/tex-katex/renderer/utils';

const unsafeNode: Element = {
  type: 'element',
  tagName: 'p',
  properties: {
    className: ['first', 'second'],
    dataExample: 'value',
    onClick: 'alert(1)',
    onclick: 'alert(2)',
    dangerouslySetInnerHTML: 'untrusted',
    style: 'color: red; font-family: "a;b"; --custom: 2',
  },
  children: [],
};

test('normalizes HAST attributes without forwarding executable properties', () => {
  expect(getTaroProps(unsafeNode)).toEqual({
    className: 'first second',
    'data-example': 'value',
    style: { color: 'red', fontFamily: '"a;b"', '--custom': '2' },
  });

  expect(styleStringToObject('background: url("a;b"); color: blue')).toEqual({
    background: 'url("a;b")',
    color: 'blue',
  });
});

test.each(['script', 'iframe', 'svg', 'object', 'invalid tag'])(
  'drops unsafe %s elements',
  (tagName) => {
    expect(isSafeTagName(tagName)).toBe(false);

    const view = render(
      <ElementRenderer Raw={null} tagName={tagName}>
        untrusted
      </ElementRenderer>,
    );

    expect(view.container).toBeEmptyDOMElement();
  },
);

test('keeps formulas untrusted and falls back for malformed input', () => {
  const formula = katexTexToHtml('E = mc^2', 'inline');

  expect(formula).toContain('katex');

  expect(formula).not.toContain('<math');

  expect(katexTexToHtml('\\unknowncommand', 'inline')).toBeNull();

  expect(katexTexToHtml('\\href{javascript:alert(1)}{x}', 'inline')).not.toContain('href=');
});
