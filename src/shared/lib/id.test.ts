import { describe, it, expect } from "vitest";
import { uid } from "./id";

describe("uid", () => {
  it("uses the provided prefix", () => {
    const value = uid("test");
    expect(value.startsWith("test_")).toBe(true);
  });

  it("generates different values across calls", () => {
    const a = uid();
    const b = uid();
    expect(a).not.toBe(b);
  });
});
