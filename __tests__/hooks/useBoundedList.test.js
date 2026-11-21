import { act, renderHook } from "@testing-library/react";
import useBoundedList from "@/hooks/useBoundedList";

describe("useBoundedList", () => {
  it("renders a bounded window and loads the next window", () => {
    const items = [1, 2, 3, 4, 5];
    const { result } = renderHook(
      ({ list }) => useBoundedList(list, 2),
      { initialProps: { list: items } }
    );

    expect(result.current.visibleItems).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toEqual([1, 2, 3, 4]);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.hasMore).toBe(false);
  });

  it("resets the window when the collection changes", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useBoundedList(items, 2),
      { initialProps: { items: [1, 2, 3, 4] } }
    );
    act(() => result.current.loadMore());
    rerender({ items: [8, 9, 10] });
    expect(result.current.visibleItems).toEqual([8, 9]);
  });
});
