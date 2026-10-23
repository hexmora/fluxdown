/** @jest-environment node */

import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';

import { CodePeleRenderer } from '../renderer';

const Raw = ({ code }: { code: string }) => <pre>{code}</pre>;

test('preserves escaped source after the lazy module resolves without browser APIs', async () => {
  const html = await new Promise<string>((resolve, reject) => {
    const output = new PassThrough();

    let content = '';

    output.setEncoding('utf8');

    output.on('data', (chunk: string) => {
      content += chunk;
    });

    output.on('end', () => resolve(content));

    output.on('error', reject);

    const { pipe } = renderToPipeableStream(
      <CodePeleRenderer
        Raw={Raw}
        code={'flowchart LR; A["<script>source</script>"]'}
        language="mermaid"
      />,
      { onAllReady: () => pipe(output), onError: reject },
    );
  });

  expect(html).toContain('&lt;script&gt;source&lt;/script&gt;');
  expect(html).not.toContain('<figure');
});
