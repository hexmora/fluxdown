import { render } from '@testing-library/react';

import { ChunkRenderer } from '..';

afterEach(() => {
  jest.restoreAllMocks();
});

test('resumes zero-origin batches using monotonic time without reading the wall clock', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(50);
  const wallClock = jest.spyOn(Date, 'now').mockReturnValue(-1);
  const first = render(
    <ChunkRenderer start={0} duration={400}>
      chunk
    </ChunkRenderer>,
  );

  expect(first.getByText('chunk')).toHaveClass('active');
  expect(first.getByText('chunk')).toHaveStyle({ animationDelay: '-50ms' });

  first.unmount();
  now.mockReturnValue(600);
  wallClock.mockReturnValue(1_000_000);

  const completed = render(
    <ChunkRenderer start={0} duration={400}>
      chunk
    </ChunkRenderer>,
  );

  expect(completed.getByText('chunk')).not.toHaveClass('active');
  expect(wallClock).not.toHaveBeenCalled();
});
