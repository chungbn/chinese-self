import { describe, expect, it } from "vitest";
import { bestStreak, computeStreak, dayKey } from "./streak";

const today = new Date(2026, 10, 21, 10);
const ago = (n: number) => dayKey(new Date(2026, 10, 21 - n));

describe("computeStreak", () => {
  it("đếm cả hôm nay nếu đã hoàn thành", () => {
    expect(computeStreak(new Set([ago(0), ago(1), ago(2)]), today)).toBe(3);
  });
  it("hôm nay chưa xong thì chuỗi tính tới hôm qua", () => {
    expect(computeStreak(new Set([ago(1), ago(2)]), today)).toBe(2);
  });
  it("bỏ lỡ hôm qua thì chuỗi về 0", () => {
    expect(computeStreak(new Set([ago(2), ago(3)]), today)).toBe(0);
  });
  it("qua ranh giới tháng", () => {
    const d = new Date(2026, 11, 1, 9);
    expect(computeStreak(new Set(["2026-11-29", "2026-11-30", "2026-12-01"]), d)).toBe(3);
  });
});

describe("bestStreak", () => {
  it("tìm chuỗi dài nhất", () => {
    expect(bestStreak(new Set(["2026-11-01", "2026-11-02", "2026-11-05", "2026-11-06", "2026-11-07"]))).toBe(3);
    expect(bestStreak(new Set())).toBe(0);
    expect(bestStreak(new Set(["2026-10-31", "2026-11-01"]))).toBe(2);
  });
});
