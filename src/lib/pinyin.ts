/** Tiện ích xử lý pinyin: hiển thị, chuyển sang dạng số thanh, so khớp câu trả lời gõ phím. */

const TONE_MARKS: Record<string, [string, number]> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4],
  ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4],
  ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4],
  ǖ: ["v", 1], ǘ: ["v", 2], ǚ: ["v", 3], ǜ: ["v", 4],
};

/** Tách pinyin dữ liệu ("dǎ diàn.huà") thành mảng âm tiết. */
export function syllables(py: string): string[] {
  return py.trim().split(/[ .]+/).filter(Boolean);
}

/** Hiển thị: "xué.sheng" → "xuésheng", "nǚ.ér" → "nǚ'ér", "dǎ diàn.huà" → "dǎ diànhuà". */
export function formatPinyin(py: string): string {
  return py
    .split(" ")
    .map((word) =>
      word
        .split(".")
        .map((s, i) => (i > 0 && /^[aeoāáǎàēéěèōóǒò]/i.test(s) ? "'" + s : s))
        .join(""),
    )
    .join(" ");
}

/** Số thanh của một âm tiết (0 = thanh nhẹ). */
export function toneOf(syllable: string): number {
  for (const ch of syllable) {
    const m = TONE_MARKS[ch];
    if (m) return m[1];
  }
  return 0;
}

/** "xué" → "xue2", "ma" → "ma", "nǚ" → "nv3". Thanh nhẹ không có số. */
export function syllableToNumbered(syllable: string): string {
  let tone = 0;
  let out = "";
  for (const ch of syllable.toLowerCase()) {
    const m = TONE_MARKS[ch];
    if (m) {
      out += m[0];
      tone = m[1];
    } else if (ch === "ü") out += "v";
    else out += ch;
  }
  return tone ? out + tone : out;
}

export function toNumbered(py: string): string {
  return syllables(py).map(syllableToNumbered).join("");
}

export function toToneless(py: string): string {
  return toNumbered(py).replace(/\d/g, "");
}

const HAN_RE = /\p{Script=Han}/u;

/** Chuẩn hoá chuỗi người dùng gõ: chữ thường, bỏ dấu cách/nháy, ü/u: → v, pinyin có dấu → số, bỏ số 5/0 (thanh nhẹ). */
export function normalizeTyped(input: string): string {
  let s = input.trim().toLowerCase().normalize("NFC");
  s = s.replace(/u:/g, "v").replace(/ü/g, "v");
  s = s.replace(/[\s'’·.-]/g, "");
  return s.replace(/[05]/g, "");
}

/**
 * Chuẩn hoá pinyin có dấu do người dùng gõ (có thể cách nhau bằng dấu cách hoặc không).
 * Nếu không có dấu thanh nào thì trả về null.
 */
function markedToNumbered(input: string): string | null {
  const s = input.trim().toLowerCase().normalize("NFC");
  if (![...s].some((ch) => TONE_MARKS[ch])) return null;
  // Đặt số thanh sau âm tiết: tìm phần phụ âm cuối (n, ng, r) ngay sau nguyên âm mang dấu.
  let out = "";
  const chars = [...s.replace(/[\s'’·.-]/g, "")];
  for (let i = 0; i < chars.length; i++) {
    const m = TONE_MARKS[chars[i]];
    if (!m) {
      out += chars[i] === "ü" ? "v" : chars[i];
      continue;
    }
    out += m[0];
    // nuốt các nguyên âm còn lại của vận mẫu
    let j = i + 1;
    while (j < chars.length && /[aeiouv]/.test(chars[j])) out += chars[j++];
    // phụ âm cuối: ng / n / r (n, ng chỉ là âm cuối nếu sau đó không phải nguyên âm)
    const rest = chars.slice(j).join("");
    let coda = "";
    if (/^ngr(?![aeiouvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])/.test(rest)) coda = "ngr";
    else if (/^nr(?![aeiouvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])/.test(rest)) coda = "nr";
    else if (/^ng(?![aeiouvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])/.test(rest)) coda = "ng";
    else if (/^n(?![aeiouvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜg])/.test(rest)) coda = "n";
    else if (/^r(?![aeiouvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ])/.test(rest)) coda = "r";
    out += coda + m[1];
    i = j + coda.length - 1;
  }
  return out;
}

export type TypedResult =
  | { ok: true; toneChecked: boolean }
  | { ok: false; reason: "tone" | "wrong" };

/**
 * Chấm câu trả lời gõ phím cho một từ.
 * Chấp nhận: chữ Hán, pinyin số thanh (xue2sheng), pinyin có dấu (xuésheng), pinyin không dấu (xuesheng — không chấm thanh).
 */
export function checkTyped(input: string, word: { hanzi: string; py: string }): TypedResult {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "wrong" };
  if (HAN_RE.test(raw)) {
    return raw.replace(/\s/g, "") === word.hanzi ? { ok: true, toneChecked: true } : { ok: false, reason: "wrong" };
  }
  const expectedNum = toNumbered(word.py);
  const expectedPlain = toToneless(word.py);
  const marked = markedToNumbered(raw);
  const typed = marked ?? normalizeTyped(raw);
  const hasTones = /[1-4]/.test(typed);
  const plain = typed.replace(/\d/g, "");
  if (plain !== expectedPlain) return { ok: false, reason: "wrong" };
  if (!hasTones) return { ok: true, toneChecked: false };
  return typed === expectedNum ? { ok: true, toneChecked: true } : { ok: false, reason: "tone" };
}

/** Bỏ dấu tiếng Việt để tìm kiếm: "Hán ngữ" → "han ngu". */
export function stripVietnamese(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
