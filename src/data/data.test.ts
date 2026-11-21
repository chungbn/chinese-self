/**
 * Kiểm tra tính nhất quán của dữ liệu do AI soạn.
 * Không thay thế việc tra từ điển, nhưng bắt được lỗi gõ, thiếu âm tiết, sai định dạng thanh điệu.
 */
import { describe, expect, it } from "vitest";
import { LESSONS, WORDS } from "./index";
import { syllables } from "../lib/pinyin";
import official from "./sources/hsk1-official.json";

const TONED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g;
// Âm tiết pinyin hợp lệ về hình thức: phụ âm đầu (tuỳ chọn) + vận mẫu + (n|ng|r) tuỳ chọn
const SYLLABLE =
  /^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(ng|n)?r?$/i;

describe("dữ liệu từ vựng", () => {
  it("id từ là duy nhất", () => {
    const ids = WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("có đủ mọi từ trong danh sách HSK 1 chính thức", () => {
    const mine = new Set(WORDS.filter((w) => w.level === 1).map((w) => w.hanzi));
    const missing = official.words.map((o) => o.h).filter((h) => !mine.has(h));
    expect(missing).toEqual([]);
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

/** Tách pinyin của danh sách gốc ("hǎo wán r") thành âm tiết, gộp "r" của 儿化 vào âm trước. */
function officialSyllables(py: string): string[] {
  const out: string[] = [];
  for (const t of py.toLowerCase().replace(/'/g, " ").split(/\s+/).filter(Boolean)) {
    if (t === "r" && out.length) out[out.length - 1] += "r";
    else out.push(t);
  }
  return out;
}

const stripTone = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");

describe("đối chiếu pinyin với danh sách HSK chính thức", () => {
  const byHanzi = new Map(WORDS.map((w) => [w.hanzi, w]));
  for (const o of official.words) {
    const w = byHanzi.get(o.h);
    if (!w) continue;
    it(`${o.h}: ${w.py} khớp ${o.py.join(" / ")}`, () => {
      const mine = syllables(w.py).map((s) => s.toLowerCase());
      const chars = [...w.hanzi];
      // 一 và 不 được phép ghi theo biến điệu (yí/yì, bú) — chỉ so phần không dấu ở các vị trí này
      const sandhi = new Set(chars.flatMap((c, i) => (c === "一" || c === "不" ? [i] : [])));
      const matches = o.py.some((form) => {
        const ref = officialSyllables(form);
        if (ref.length !== mine.length) return false;
        return ref.every((r, i) => (sandhi.has(i) ? stripTone(r) === stripTone(mine[i]) : r === mine[i]));
      });
      expect(matches).toBe(true);
    });
  }
});
