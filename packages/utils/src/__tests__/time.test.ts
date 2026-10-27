import { restoreGlobals, stubGlobal } from '../../../../scripts/testing/globals';
import { getTime } from '../time';

afterEach(() => {
  jest.restoreAllMocks();

  restoreGlobals();
});

describe('getTime', () => {
  test('uses the monotonic clock when the host provides it', () => {
    stubGlobal('performance', { now: () => 42.5 });

    const wallClock = jest.spyOn(Date, 'now');

    expect(getTime()).toBe(42.5);

    expect(wallClock).not.toHaveBeenCalled();
  });

  test.each([undefined, {}])('supports a native host without performance.now', (performance) => {
    stubGlobal('performance', performance);

    jest.spyOn(Date, 'now').mockReturnValue(1234);

    expect(getTime()).toBe(1234);
  });
});
