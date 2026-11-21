import { describe, expect, it } from "vitest";
import { BACKLOG_LIMIT, buildDailyPlan, drillModeFor, type PlanInput } from "./plan";

const lessons = Array.from({ length: 3 }, (_, i) => ({ id: `l${i + 1}`, order: i + 1, title: `Bài ${i + 1}`, wordCount: 15 }));
const now = new Date(2026, 10, 21, 9, 0);
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

function input(over: Partial<PlanInput> = {}): PlanInput {
  return {
    now,
    startedAt: now,
    pinyinDone: false,
    drillToday: 0,
    pinyinTabsToday: [],
    pinyinTopicsSeen: [],
    dueCount: 0,
    totalCards: 0,
    reviewedToday: 0,
    lessons,
    completed: [],
    ...over,
  };
}

const ids = (p: ReturnType<typeof buildDailyPlan>) => p.tasks.map((t) => t.id);

describe("buildDailyPlan", () => {
  it("ngày đầu: chỉ học pinyin, chưa có bài mới", () => {
    const p = buildDailyPlan(input());
    expect(p.phase).toBe("pinyin");
    expect(ids(p)).toEqual(["pinyin-topic", "pinyin-drill"]);
    expect(p.tasks[0].to).toBe("/pinyin?tab=tones");
    expect(p.note).toMatch(/Bài 1/);
  });

  it("từ ngày thứ 3: thêm Bài 1 song song với pinyin", () => {
    const p = buildDailyPlan(input({ startedAt: daysAgo(2) }));
    expect(ids(p)).toEqual(["pinyin-topic", "pinyin-drill", "lesson"]);
    expect(p.tasks[0].to).toBe("/pinyin?tab=sounds");
    expect(p.tasks[2].to).toBe("/lessons/l1");
  });

  it("luyện nghe chỉ gồm nội dung đã học", () => {
    const drill = (over: Partial<PlanInput>) => buildDailyPlan(input(over)).tasks.find((t) => t.id === "pinyin-drill")!;
    // Ngày 1: mới học thanh điệu -> chỉ luyện 4 thanh
    expect(drill({}).to).toBe("/pinyin?tab=drill&mode=tones");
    // Ngày 3–5: học thanh mẫu/vận mẫu -> vẫn chỉ luyện thanh
    expect(drill({ startedAt: daysAgo(3), pinyinTopicsSeen: ["tones", "sounds"] }).to).toBe("/pinyin?tab=drill&mode=tones");
    // Ngày 6: học lỗi hay gặp -> luyện âm dễ nhầm
    expect(drill({ startedAt: daysAgo(5) }).to).toBe("/pinyin?tab=drill&mode=pairs");
    // Sau đó -> tổng hợp
    expect(drill({ startedAt: daysAgo(7), pinyinTopicsSeen: ["tones", "sounds", "pitfalls"] }).to).toBe("/pinyin?tab=drill&mode=mix");
  });

  it("drillModeFor", () => {
    expect(drillModeFor("tones", [])).toBe("tones");
    expect(drillModeFor("pitfalls", [])).toBe("pairs");
    expect(drillModeFor(null, ["pitfalls"])).toBe("mix");
    expect(drillModeFor(null, ["tones"])).toBe("tones");
  });

  it("đánh dấu xong luyện nghe khi đủ 20 câu và chủ đề khi đã mở tab", () => {
    const p = buildDailyPlan(input({ drillToday: 25, pinyinTabsToday: ["tones"] }));
    expect(p.tasks.find((t) => t.id === "pinyin-drill")?.done).toBe(true);
    expect(p.tasks.find((t) => t.id === "pinyin-topic")?.done).toBe(true);
  });

  it("ôn tập luôn đứng đầu, rồi tới bài tiếp theo", () => {
    const p = buildDailyPlan(
      input({ pinyinDone: true, dueCount: 12, totalCards: 45, completed: [{ id: "l1", completedAt: daysAgo(1) }] }),
    );
    expect(p.phase).toBe("vocab");
    expect(ids(p)).toEqual(["review", "lesson"]);
    expect(p.tasks[1].to).toBe("/lessons/l2");
    expect(p.progress?.label).toBe("1/3 bài");
  });

  it("tạm dừng bài mới khi tồn đọng nhiều thẻ", () => {
    const p = buildDailyPlan(input({ pinyinDone: true, dueCount: BACKLOG_LIMIT + 1, totalCards: 200, completed: [{ id: "l1", completedAt: daysAgo(3) }] }));
    const lesson = p.tasks.find((t) => t.id === "lesson");
    expect(lesson?.tone).toBe("blocked");
    expect(lesson?.to).toBe("/review");
  });

  it("đã học 1 bài hôm nay: đánh dấu xong, chỉ gợi ý thêm khi ít thẻ", () => {
    const base = { pinyinDone: true, totalCards: 45, completed: [{ id: "l1", completedAt: now }] };
    const few = buildDailyPlan(input({ ...base, dueCount: 5 }));
    expect(few.tasks.find((t) => t.id === "lesson")?.done).toBe(true);
    expect(few.tasks.find((t) => t.id === "lesson-extra")?.done).toBeNull();
    const many = buildDailyPlan(input({ ...base, dueCount: 30 }));
    expect(ids(many)).not.toContain("lesson-extra");
  });

  it("ôn xong hết thẻ: việc ôn tập được đánh dấu hoàn thành", () => {
    const p = buildDailyPlan(input({ pinyinDone: true, totalCards: 45, reviewedToday: 40, completed: [{ id: "l1", completedAt: daysAgo(1) }] }));
    expect(p.tasks[0]).toMatchObject({ id: "review", done: true });
  });

  it("học hết bài: chuyển sang củng cố", () => {
    const completed = lessons.map((l) => ({ id: l.id, completedAt: daysAgo(5) }));
    const p = buildDailyPlan(input({ pinyinDone: true, totalCards: 135, dueCount: 3, completed }));
    expect(p.phase).toBe("consolidate");
    expect(ids(p)).toEqual(["review", "reread"]);
  });

  it("chưa tích pinyin nhưng đã học bài: vẫn ở giai đoạn từ vựng và tiếp tục luyện nghe", () => {
    const p = buildDailyPlan(input({ startedAt: daysAgo(5), completed: [{ id: "l1", completedAt: daysAgo(1) }], totalCards: 51 }));
    expect(p.phase).toBe("vocab");
    expect(ids(p)).toEqual(["review", "pinyin-drill", "lesson"]);
  });
});
