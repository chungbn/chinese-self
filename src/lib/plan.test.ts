import { describe, expect, it } from "vitest";
import { BACKLOG_LIMIT, buildDailyPlan, deriveSteps, drillModeFor, PINYIN_STEPS, type PlanInput } from "./plan";

const lessons = Array.from({ length: 3 }, (_, i) => ({ id: `l${i + 1}`, order: i + 1, title: `Bài ${i + 1}`, wordCount: 15 }));
const now = new Date(2026, 10, 21, 9, 0);
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const TODAY = key(now);
/** Lịch sử bước theo nhịp mặc định: mỗi ngày một bước, từ n ngày trước tới hôm qua */
const onPace = (n: number) => Array.from({ length: Math.min(n, PINYIN_STEPS.length) }, (_, i) => key(daysAgo(n - i)));

function input(over: Partial<PlanInput> = {}): PlanInput {
  return {
    now,
    startedAt: now,
    pinyinDone: false,
    drillToday: 0,
    pinyinSteps: [],
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
    expect(p.tasks[0].to).toBe("/session/pinyin-topic");
    expect(p.tasks[0].session).toEqual({ kind: "pinyin-topic", topic: "tones", step: 0 });
    expect(p.note).toMatch(/Bài 1/);
  });

  it("từ ngày thứ 3: thêm Bài 1 song song với pinyin", () => {
    const p = buildDailyPlan(input({ startedAt: daysAgo(2), pinyinSteps: onPace(2) }));
    expect(ids(p)).toEqual(["pinyin-topic", "pinyin-drill", "lesson"]);
    expect(p.tasks[0].session).toEqual({ kind: "pinyin-topic", topic: "initials", step: 2 });
    expect(p.tasks[2].session).toEqual({ kind: "lesson", lessonId: "l1" });
  });

  it("luyện nghe chỉ gồm nội dung đã học", () => {
    const mode = (over: Partial<PlanInput>) => {
      const s = buildDailyPlan(input(over)).tasks.find((t) => t.id === "pinyin-drill")!.session;
      return s.kind === "drill" ? s.mode : null;
    };
    // Ngày 1: mới học thanh điệu -> chỉ luyện 4 thanh
    expect(mode({})).toBe("tones");
    // Ngày 3–5: học thanh mẫu/vận mẫu -> vẫn chỉ luyện thanh
    expect(mode({ startedAt: daysAgo(3), pinyinSteps: onPace(3), pinyinTopicsSeen: ["tones", "initials", "sounds"] })).toBe("tones");
    // Ngày 6: học lỗi hay gặp -> luyện âm dễ nhầm
    expect(mode({ startedAt: daysAgo(5), pinyinSteps: onPace(5) })).toBe("pairs");
    // Sau đó -> tổng hợp
    expect(mode({ startedAt: daysAgo(7), pinyinTopicsSeen: ["tones", "sounds", "pitfalls"] })).toBe("mix");
  });

  it("phần thanh mẫu / vận mẫu chia 3 ngày", () => {
    const topic = (n: number) => {
      const s = buildDailyPlan(input({ startedAt: daysAgo(n), pinyinSteps: onPace(n) })).tasks.find((t) => t.id === "pinyin-topic")?.session;
      return s?.kind === "pinyin-topic" ? s.topic : null;
    };
    expect([0, 1, 2, 3, 4, 5, 7, 9].map(topic)).toEqual(["tones", "tones", "initials", "finals-1", "finals-2", "pitfalls", "sandhi", null]);
  });

  it("nghỉ vài ngày: tiếp tục đúng bước còn dở, không bỏ sót", () => {
    const p = buildDailyPlan(input({ startedAt: daysAgo(6), pinyinSteps: [key(daysAgo(6)), key(daysAgo(5))] }));
    expect(p.tasks.find((t) => t.id === "pinyin-topic")?.session).toMatchObject({ topic: "initials", step: 2 });
  });

  it("học trước: xong bước hôm nay thì gợi ý bước kế tiếp, mai học tiếp từ đó", () => {
    const p = buildDailyPlan(input({ pinyinSteps: [TODAY] }));
    const ahead = p.tasks.find((t) => t.id === "pinyin-ahead-1");
    expect(ahead).toMatchObject({ done: null, to: "/session/pinyin-ahead-1", session: { kind: "pinyin-topic", step: 1 } });
    // Học trước 2 bước trong ngày đầu -> có pace và gợi ý học trước Bài 1
    const p2 = buildDailyPlan(input({ pinyinSteps: [TODAY, TODAY, TODAY] }));
    expect(ids(p2)).toContain("pinyin-ahead-3");
    expect(ids(p2)).toContain("lesson-extra-1");
    expect(p2.pace).toMatch(/2 phần pinyin/);
    // Hôm sau: tiếp tục từ bước 3, Bài 1 trở thành việc chính
    const tomorrow = new Date(now.getTime() + 86_400_000);
    const p3 = buildDailyPlan(input({ now: tomorrow, startedAt: now, pinyinSteps: [TODAY, TODAY, TODAY] }));
    expect(p3.tasks.find((t) => t.id === "pinyin-topic")?.session).toMatchObject({ topic: "finals-1", step: 3 });
    expect(p3.tasks.find((t) => t.id === "lesson")?.done).toBe(false);
  });

  it("chưa học pinyin hôm nay thì chưa gợi ý học trước", () => {
    expect(ids(buildDailyPlan(input()))).not.toContain("pinyin-ahead-1");
    expect(ids(buildDailyPlan(input()))).not.toContain("lesson-extra-1");
  });

  it("deriveSteps: dựng lại tiến độ từ dữ liệu cũ", () => {
    expect(
      deriveSteps([
        { day: "2026-11-20", tabs: ["tones"] },
        { day: "2026-11-21", tabs: ["tones", "initials"] },
        { day: "2026-11-22", tabs: ["finals-1", "sounds"] },
      ]),
    ).toEqual(["2026-11-20", "2026-11-21", "2026-11-21", "2026-11-22"]);
  });

  it("drillModeFor", () => {
    expect(drillModeFor("tones", [])).toBe("tones");
    expect(drillModeFor("pitfalls", [])).toBe("pairs");
    expect(drillModeFor(null, ["pitfalls"])).toBe("mix");
    expect(drillModeFor(null, ["tones"])).toBe("tones");
  });

  it("đánh dấu xong luyện nghe khi đủ 20 câu và chủ đề khi đã học xong bước hôm nay", () => {
    const p = buildDailyPlan(input({ drillToday: 25, pinyinSteps: [TODAY] }));
    expect(p.tasks.find((t) => t.id === "pinyin-drill")?.done).toBe(true);
    expect(p.tasks.find((t) => t.id === "pinyin-topic")?.done).toBe(true);
  });

  it("ôn tập luôn đứng đầu, rồi tới bài tiếp theo", () => {
    const p = buildDailyPlan(
      input({ pinyinDone: true, dueCount: 12, totalCards: 45, completed: [{ id: "l1", completedAt: daysAgo(1) }] }),
    );
    expect(p.phase).toBe("vocab");
    expect(ids(p)).toEqual(["review", "lesson"]);
    expect(p.tasks[1].session).toEqual({ kind: "lesson", lessonId: "l2" });
    expect(p.progress?.label).toBe("1/3 bài");
  });

  it("tạm dừng bài mới khi tồn đọng nhiều thẻ", () => {
    const p = buildDailyPlan(input({ pinyinDone: true, dueCount: BACKLOG_LIMIT + 1, totalCards: 200, completed: [{ id: "l1", completedAt: daysAgo(3) }] }));
    const lesson = p.tasks.find((t) => t.id === "lesson");
    expect(lesson?.tone).toBe("blocked");
    expect(lesson?.session).toEqual({ kind: "review" });
  });

  it("đã học 1 bài hôm nay: đánh dấu xong, gợi ý học trước trừ khi tồn đọng quá nhiều", () => {
    const base = { pinyinDone: true, totalCards: 45, completed: [{ id: "l1", completedAt: now }] };
    const few = buildDailyPlan(input({ ...base, dueCount: 5 }));
    expect(few.tasks.find((t) => t.id === "lesson")?.done).toBe(true);
    expect(few.tasks.find((t) => t.id === "lesson-extra-2")?.done).toBeNull();
    const some = buildDailyPlan(input({ ...base, dueCount: 30 }));
    expect(some.tasks.find((t) => t.id === "lesson-extra-2")?.detail).toMatch(/nên ôn trước/);
    const many = buildDailyPlan(input({ ...base, dueCount: BACKLOG_LIMIT + 1 }));
    expect(ids(many).some((id) => id.startsWith("lesson-extra"))).toBe(false);
  });

  it("học 2 bài trong ngày: báo đi trước lộ trình", () => {
    const p = buildDailyPlan(
      input({ startedAt: daysAgo(2), pinyinDone: true, totalCards: 90, completed: [{ id: "l1", completedAt: now }, { id: "l2", completedAt: now }] }),
    );
    expect(p.pace).toMatch(/1 bài/);
    expect(p.tasks.find((t) => t.id === "lesson")?.title).toMatch(/2 bài/);
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

  it("đã học bài trong 2 tuần đầu: vẫn tiếp tục chủ đề pinyin song song", () => {
    const p = buildDailyPlan(input({ startedAt: daysAgo(3), pinyinSteps: onPace(3), completed: [{ id: "l1", completedAt: daysAgo(1) }], totalCards: 51 }));
    expect(p.phase).toBe("vocab");
    expect(ids(p)).toEqual(["review", "pinyin-topic", "pinyin-drill", "lesson"]);
    expect(p.tasks[1].session).toEqual({ kind: "pinyin-topic", topic: "finals-1", step: 3 });
  });

  it("học hết các bước pinyin nhưng chưa tích nắm vững: chỉ còn luyện nghe", () => {
    const p = buildDailyPlan(input({ startedAt: daysAgo(15), pinyinSteps: onPace(15), completed: [{ id: "l1", completedAt: daysAgo(1) }], totalCards: 51 }));
    expect(ids(p)).toEqual(["review", "pinyin-drill", "lesson"]);
  });
});
