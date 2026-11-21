import { act, renderHook } from '@testing-library/react';
import useSingleFlight from '@/hooks/useSingleFlight';

describe('useSingleFlight', () => {
  it('shares one promise while an action is in flight', async () => {
    const resolvers = [];
    const action = vi.fn(() => new Promise((done) => { resolvers.push(done); }));
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
    resolvers[0]('created');
    await expect(first).resolves.toBe('created');

    let retry;
    await act(async () => {
      retry = result.current('retry');
      await Promise.resolve();
    });
    expect(action).toHaveBeenCalledTimes(2);
    resolvers[1]('retried');
    await expect(retry).resolves.toBe('retried');
  });
});
