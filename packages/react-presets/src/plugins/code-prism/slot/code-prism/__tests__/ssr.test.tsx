/** @jest-environment node */

import { renderToString } from 'react-dom/server';

import { CodePrismRenderer } from '../renderer';

jest.mock('../renderer/utils', () => {
  throw new Error('Prism must not load during server rendering');
});

describe('Prism server rendering', () => {
  test('renders escaped source and suffixes without loading the highlighter', () => {
    const markup = renderToString(
      <CodePrismRenderer
        Raw={null}
        code={'<script>alert("source")</script>\n'}
        language="html"
        suffix={<i>tail</i>}
      />,
    );

    expect(markup).toContain('language-html');
    expect(markup).toContain('&lt;script&gt;alert(&quot;source&quot;)&lt;/script&gt;');
    expect(markup).toContain('<i>tail</i>');
    expect(markup).not.toContain('class="token');
  });
});
