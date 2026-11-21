/**
 * Kiểm tra tính nhất quán của dữ liệu do AI soạn.
 * Không thay thế việc tra từ điển, nhưng bắt được lỗi gõ, thiếu âm tiết, sai định dạng thanh điệu.
 */
import { describe, expect, it } from "vitest";
import { LESSONS, WORDS } from "./index";
import { syllables } from "../lib/pinyin";

const TONED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g;
// Âm tiết pinyin hợp lệ về hình thức: phụ âm đầu (tuỳ chọn) + vận mẫu + (n|ng|r) tuỳ chọn
const SYLLABLE =
  /^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(ng|n)?r?$/i;

describe("dữ liệu từ vựng", () => {
  it("id từ là duy nhất", () => {
    const ids = WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("HSK 1 có đúng 150 từ", () => {
    expect(WORDS.filter((w) => w.level === 1)).toHaveLength(150);
  });

  it("mỗi bài tham chiếu tới từ tồn tại", () => {
    const ids = new Set(WORDS.map((w) => w.id));
    for (const l of LESSONS) for (const id of l.wordIds) expect(ids.has(id)).toBe(true);
  });

  for (const w of WORDS) {
    describe(`${w.hanzi} (${w.py})`, () => {
      const chars = [...w.hanzi];
      const syl = syllables(w.py);

      it("số âm tiết pinyin khớp số chữ Hán (儿化 gộp vào âm trước)", () => {
        const erCount = chars.filter((c, i) => c === "儿" && i > 0 && syl.some((s) => /r$/.test(s) && s !== "ér")).length;
        expect(syl.length).toBe(chars.length - erCount);
      });

      it("mỗi âm tiết hợp lệ và có tối đa 1 dấu thanh", () => {
        for (const s of syl) {
          expect(s, s).toMatch(SYLLABLE);
          expect((s.match(TONED) ?? []).length, s).toBeLessThanOrEqual(1);
        }
      });

      it("số âm Hán Việt khớp số chữ Hán", () => {
        expect(w.hv.split(" ").filter(Boolean)).toHaveLength(chars.length);
      });

      it("câu ví dụ chứa từ và có đủ 3 phần", () => {
        if (!w.ex) return;
        const [zh, py, vi] = w.ex;
        expect(zh).toContain(w.hanzi);
        expect(py.length).toBeGreaterThan(0);
        expect(vi.length).toBeGreaterThan(0);
      });
    });
  }
});
