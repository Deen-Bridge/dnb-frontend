import { act, renderHook } from '@testing-library/react';
import useSingleFlight from '@/hooks/useSingleFlight';

describe('useSingleFlight', () => {
  it('shares one promise while an action is in flight', async () => {
    let resolve;
    const action = vi.fn(() => new Promise((done) => { resolve = done; }));
    const { result } = renderHook(() => useSingleFlight(action));

    let first;
    let second;
    await act(async () => {
      first = result.current('payload');
      second = result.current('payload');
      await Promise.resolve();
    });

    expect(second).toBe(first);
    expect(action).toHaveBeenCalledTimes(1);
    resolve('created');
    await expect(first).resolves.toBe('created');

    await act(async () => {
      await result.current('retry');
    });
    expect(action).toHaveBeenCalledTimes(2);
  });
});
