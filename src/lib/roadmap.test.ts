import { describe, expect, it } from "vitest";
import { buildRoadmap, scheduleLessons, type RoadmapInput } from "./roadmap";

const now = new Date(2026, 10, 21, 9);
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const lessons = Array.from({ length: 4 }, (_, i) => ({ id: `l${i + 1}`, order: i + 1, title: `Bài ${i + 1}`, wordCount: 15 }));
const d = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

function input(over: Partial<RoadmapInput> = {}): RoadmapInput {
  return {
    now,
    startedAt: now,
    pinyinDone: false,
    pinyinTopicsSeen: [],
    drillTotal: 0,
    lessons,
    completed: [],
    learnedWords: 0,
    masteredWords: 0,
    totalWords: 60,
    ...over,
  };
}

describe("scheduleLessons", () => {
  it("ngày đầu: Bài 1 dự kiến vào ngày thứ 3", () => {
    const s = scheduleLessons(input());
    expect(s.map((l) => d(l.date))).toEqual(["11/23", "11/24", "11/25", "11/26"]);
    expect(s[0].status).toBe("next");
  });

  it("đã học bài hôm nay: bài tiếp theo dự kiến ngày mai", () => {
    const s = scheduleLessons(input({ startedAt: daysAgo(5), completed: [{ id: "l1", completedAt: now }] }));
    expect(s[0].status).toBe("done");
    expect(s.slice(1).map((l) => d(l.date))).toEqual(["11/22", "11/23", "11/24"]);
  });

  it("chưa học bài hôm nay: bài tiếp theo là hôm nay", () => {
    const s = scheduleLessons(input({ startedAt: daysAgo(5), completed: [{ id: "l1", completedAt: daysAgo(1) }] }));
    expect(d(s[1].date)).toBe("11/21");
  });
});

describe("buildRoadmap", () => {
  it("người mới: giai đoạn 1 đang học, HSK 1 sắp tới, HSK 2 khoá", () => {
    const r = buildRoadmap(input());
    expect(r.stages.map((s) => s.status)).toEqual(["current", "upcoming", "upcoming", "locked", "locked"]);
    expect(r.currentLabel).toMatch(/Phát âm/);
    expect(d(r.hsk1FinishDate!)).toBe("11/26");
  });

  it("học song song: pinyin chưa xong nhưng đã bắt đầu bài", () => {
    const r = buildRoadmap(input({ startedAt: daysAgo(3), completed: [{ id: "l1", completedAt: daysAgo(1) }] }));
    expect(r.stages[0].status).toBe("current");
    expect(r.stages[1].status).toBe("current");
    expect(r.currentLabel).toBe("Giai đoạn 2 · HSK 1 — bài 2/4");
  });

  it("đếm mục pinyin đã xong", () => {
    const r = buildRoadmap(input({ pinyinTopicsSeen: ["tones", "sounds"], drillTotal: 120 }));
    expect(r.stages[0].progress?.label).toBe("3/6 mục");
  });

  it("học hết bài: củng cố; đủ 80% từ thuộc vững thì hoàn thành", () => {
    const completed = lessons.map((l) => ({ id: l.id, completedAt: daysAgo(10) }));
    const mid = buildRoadmap(input({ pinyinDone: true, completed, masteredWords: 20 }));
    expect(mid.stages[2].status).toBe("current");
    expect(mid.hsk1FinishDate).toBeNull();
    const fin = buildRoadmap(input({ pinyinDone: true, completed, masteredWords: 50 }));
    expect(fin.stages[2].status).toBe("done");
    expect(fin.currentLabel).toMatch(/Đã xong HSK 1/);
  });
});
