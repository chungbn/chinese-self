import { describe, expect, it } from "vitest";
import { checkTyped, formatPinyin, stripVietnamese, toNumbered, toToneless, toneOf } from "./pinyin";

describe("formatPinyin", () => {
  it("nối âm tiết trong từ", () => {
    expect(formatPinyin("xué.sheng")).toBe("xuésheng");
    expect(formatPinyin("nǚ.ér")).toBe("nǚ'ér");
    expect(formatPinyin("dǎ diàn.huà")).toBe("dǎ diànhuà");
    expect(formatPinyin("Zhōng.guó")).toBe("Zhōngguó");
  });
});

describe("toNumbered / toToneless", () => {
  it("chuyển dấu thanh sang số", () => {
    expect(toNumbered("xué.sheng")).toBe("xue2sheng");
    expect(toNumbered("nǚ.ér")).toBe("nv3er2");
    expect(toNumbered("nǎr")).toBe("nar3");
    expect(toNumbered("yì.diǎnr")).toBe("yi4dianr3");
    expect(toToneless("Zhōng.guó")).toBe("zhongguo");
  });
  it("toneOf", () => {
    expect(toneOf("mā")).toBe(1);
    expect(toneOf("ma")).toBe(0);
    expect(toneOf("lǜ")).toBe(4);
  });
});

describe("checkTyped", () => {
  const xuesheng = { hanzi: "学生", py: "xué.sheng" };
  it("chấp nhận chữ Hán", () => {
    expect(checkTyped("学生", xuesheng)).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("学习", xuesheng)).toEqual({ ok: false, reason: "wrong" });
  });
  it("chấp nhận pinyin số", () => {
    expect(checkTyped("xue2sheng", xuesheng)).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("xue2 sheng5", xuesheng)).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("xue3sheng", xuesheng)).toEqual({ ok: false, reason: "tone" });
  });
  it("chấp nhận pinyin có dấu", () => {
    expect(checkTyped("xuésheng", xuesheng)).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("Zhōngguó", { hanzi: "中国", py: "Zhōng.guó" })).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("diànnǎo", { hanzi: "电脑", py: "diàn.nǎo" })).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("nǚ'ér", { hanzi: "女儿", py: "nǚ.ér" })).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("yìdiǎnr", { hanzi: "一点儿", py: "yì.diǎnr" })).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("tiānqì", { hanzi: "天气", py: "tiān.qì" })).toEqual({ ok: true, toneChecked: true });
    expect(checkTyped("xuěsheng", xuesheng)).toEqual({ ok: false, reason: "tone" });
  });
  it("pinyin không dấu: đúng nhưng không chấm thanh", () => {
    expect(checkTyped("xuesheng", xuesheng)).toEqual({ ok: true, toneChecked: false });
    expect(checkTyped("nver", { hanzi: "女儿", py: "nǚ.ér" })).toEqual({ ok: true, toneChecked: false });
    expect(checkTyped("nüer", { hanzi: "女儿", py: "nǚ.ér" })).toEqual({ ok: true, toneChecked: false });
    expect(checkTyped("xuexi", xuesheng)).toEqual({ ok: false, reason: "wrong" });
  });
});

describe("stripVietnamese", () => {
  it("bỏ dấu", () => {
    expect(stripVietnamese("Hán ngữ")).toBe("han ngu");
    expect(stripVietnamese("đồng học")).toBe("dong hoc");
  });
});
