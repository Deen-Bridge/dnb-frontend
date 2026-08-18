/**
 * useCan — fail-closed-while-loading + delegation to can().
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { CAPABILITIES } from "@/lib/auth/roles";

let _auth = { user: null, loading: true };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => _auth,
}));

import { useCan } from "@/hooks/useCan";

beforeEach(() => {
  _auth = { user: null, loading: true };
});

describe("useCan", () => {
  it("denies everything while auth is loading, even for a verified educator", () => {
    _auth = { user: { role: "educator", isVerified: true }, loading: true };
    const { result } = renderHook(() => useCan());
    expect(result.current.can(CAPABILITIES.COURSE_CREATE)).toBe(false);
    expect(result.current.loading).toBe(true);
    expect(result.current.role).toBe(null);
    expect(result.current.isVerified).toBe(false);
  });

  it("delegates to can() once resolved — verified educator allowed", () => {
    _auth = { user: { role: "educator", isVerified: true }, loading: false };
    const { result } = renderHook(() => useCan());
    expect(result.current.can(CAPABILITIES.COURSE_CREATE)).toBe(true);
    expect(result.current.role).toBe("educator");
    expect(result.current.isVerified).toBe(true);
  });

  it("denies a resolved student", () => {
    _auth = { user: { role: "student" }, loading: false };
    const { result } = renderHook(() => useCan());
    expect(result.current.can(CAPABILITIES.COURSE_CREATE)).toBe(false);
    expect(result.current.role).toBe("student");
  });

  it("denies a resolved unverified educator", () => {
    _auth = { user: { role: "educator" }, loading: false };
    const { result } = renderHook(() => useCan());
    expect(result.current.can(CAPABILITIES.BOOK_CREATE)).toBe(false);
    expect(result.current.isVerified).toBe(false);
  });
});
