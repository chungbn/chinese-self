/** Mô hình lộ trình học tổng thể: các giai đoạn, tiến độ, ngày dự kiến. */

import { daysBetween, LESSON_START_DAY } from "./plan";

export type StageStatus = "done" | "current" | "upcoming" | "locked";

export type RoadmapItem = { label: string; done: boolean; to?: string };

export type RoadmapLesson = {
  id: string;
  order: number;
  title: string;
  wordCount: number;
  status: "done" | "next" | "upcoming";
  /** Ngày hoàn thành (đã học) hoặc ngày dự kiến (chưa học) */
  date: Date;
};

export type RoadmapStage = {
  id: "pinyin" | "hsk1" | "consolidate" | "hsk2" | "hsk3";
  title: string;
  period: string;
  goal: string;
  status: StageStatus;
  progress?: { done: number; total: number; label: string };
  items?: RoadmapItem[];
  lessons?: RoadmapLesson[];
};

export type Roadmap = {
  stages: RoadmapStage[];
  /** Ngày dự kiến học xong bài cuối HSK 1 (nếu còn bài) */
  hsk1FinishDate: Date | null;
  currentLabel: string;
};

export type RoadmapInput = {
  now: Date;
  startedAt: Date;
  pinyinDone: boolean;
  /** Các phần pinyin từng mở */
  pinyinTopicsSeen: string[];
  drillTotal: number;
  lessons: { id: string; order: number; title: string; wordCount: number }[];
  completed: { id: string; completedAt: Date }[];
  /** Số từ đã đưa vào lịch ôn */
  learnedWords: number;
  /** Số từ cả 3 kỹ năng đều có khoảng ôn ≥ MASTERED_DAYS */
  masteredWords: number;
  totalWords: number;
};

export const DRILL_TARGET = 100;
export const MASTERED_DAYS = 21;
/** Đủ tỉ lệ này số từ thuộc vững thì coi như xong giai đoạn củng cố */
export const MASTERY_TARGET = 0.8;

const PINYIN_TOPICS: { tab: string; label: string }[] = [
  { tab: "tones", label: "Học 4 thanh điệu" },
  { tab: "sounds", label: "Thanh mẫu & vận mẫu" },
  { tab: "pitfalls", label: "Các lỗi người Việt hay mắc" },
  { tab: "sandhi", label: "Quy tắc biến điệu" },
];

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Ngày dự kiến cho các bài chưa học, nhịp 1 bài/ngày.
 * Hôm nay đã học bài thì bắt đầu từ ngày mai; đang ở 2 ngày đầu (chỉ học pinyin) thì bắt đầu từ ngày thứ 3.
 */
export function scheduleLessons(input: Pick<RoadmapInput, "now" | "startedAt" | "lessons" | "completed">): RoadmapLesson[] {
  const { now, startedAt } = input;
  const doneMap = new Map(input.completed.map((c) => [c.id, c.completedAt]));
  const learnedToday = input.completed.some((c) => sameDay(c.completedAt, now));
  const day = daysBetween(startedAt, now);
  let offset = learnedToday ? 1 : 0;
  if (input.completed.length === 0 && day < LESSON_START_DAY) offset = LESSON_START_DAY - day;
  let nextAssigned = false;
  return [...input.lessons]
    .sort((a, b) => a.order - b.order)
    .map((l) => {
      const doneAt = doneMap.get(l.id);
      if (doneAt) return { ...l, status: "done" as const, date: doneAt };
      const status = nextAssigned ? ("upcoming" as const) : ("next" as const);
      nextAssigned = true;
      return { ...l, status, date: addDays(now, offset++) };
    });
}

export function buildRoadmap(input: RoadmapInput): Roadmap {
  const lessons = scheduleLessons(input);
  const doneLessons = lessons.filter((l) => l.status === "done").length;
  const allLessonsDone = doneLessons === lessons.length && lessons.length > 0;
  const remaining = lessons.filter((l) => l.status !== "done");
  const hsk1FinishDate = remaining.length ? remaining[remaining.length - 1].date : null;
  const mastery = input.totalWords ? input.masteredWords / input.totalWords : 0;
  const consolidated = allLessonsDone && mastery >= MASTERY_TARGET;
  const day = daysBetween(input.startedAt, input.now);
  const lessonsStarted = doneLessons > 0 || input.pinyinDone || day >= LESSON_START_DAY;

  const pinyinItems: RoadmapItem[] = [
    ...PINYIN_TOPICS.map((t) => ({ label: t.label, done: input.pinyinTopicsSeen.includes(t.tab), to: `/pinyin?tab=${t.tab}` })),
    {
      label: `Luyện nghe ${DRILL_TARGET} câu (${Math.min(input.drillTotal, DRILL_TARGET)}/${DRILL_TARGET})`,
      done: input.drillTotal >= DRILL_TARGET,
      to: "/pinyin?tab=drill",
    },
    { label: "Tự đánh giá: đã nắm vững pinyin", done: input.pinyinDone, to: "/pinyin" },
  ];

  const stages: RoadmapStage[] = [
    {
      id: "pinyin",
      title: "Phát âm: Pinyin & thanh điệu",
      period: "Tuần 1–2",
      goal: "Nghe phân biệt được 4 thanh, đọc đúng pinyin, không nhầm các âm dễ lẫn.",
      status: input.pinyinDone ? "done" : "current",
      progress: {
        done: pinyinItems.filter((i) => i.done).length,
        total: pinyinItems.length,
        label: `${pinyinItems.filter((i) => i.done).length}/${pinyinItems.length} mục`,
      },
      items: pinyinItems,
    },
    {
      id: "hsk1",
      title: "Từ vựng & ngữ pháp HSK 1",
      period: "Tuần 1–5 · 1 bài/ngày",
      goal: `${input.totalWords} từ, 20 bài theo chủ đề: chào hỏi, số đếm, gia đình, thời gian, mua sắm…`,
      status: allLessonsDone ? "done" : lessonsStarted ? "current" : "upcoming",
      progress: { done: doneLessons, total: lessons.length, label: `${doneLessons}/${lessons.length} bài` },
      lessons,
    },
    {
      id: "consolidate",
      title: "Củng cố HSK 1",
      period: "Tuần 6–8",
      goal: `Ôn đều mỗi ngày tới khi ${Math.round(MASTERY_TARGET * 100)}% số từ được nhớ vững (khoảng ôn ≥ ${MASTERED_DAYS} ngày), làm thử đề HSK 1.`,
      status: consolidated ? "done" : allLessonsDone ? "current" : "upcoming",
      progress: {
        done: input.masteredWords,
        total: input.totalWords,
        label: `${input.masteredWords}/${input.totalWords} từ thuộc vững`,
      },
      items: [
        { label: "Học xong 20 bài HSK 1", done: allLessonsDone, to: "/lessons" },
        { label: `${Math.round(MASTERY_TARGET * 100)}% số từ thuộc vững`, done: mastery >= MASTERY_TARGET, to: "/review" },
      ],
    },
    {
      id: "hsk2",
      title: "HSK 2",
      period: "Tháng 3–4",
      goal: "Khoảng 200 từ mới, câu so sánh, bổ ngữ, 了 / 过 / 着. Sẽ được bổ sung vào app.",
      status: "locked",
    },
    {
      id: "hsk3",
      title: "HSK 3 trở lên",
      period: "Từ tháng 5",
      goal: "Đọc đoạn văn ngắn, giao tiếp các chủ đề thường ngày.",
      status: "locked",
    },
  ];

  const currentLabel = !input.pinyinDone && doneLessons === 0
    ? "Giai đoạn 1 · Phát âm"
    : !allLessonsDone
      ? `Giai đoạn 2 · HSK 1 — bài ${Math.min(doneLessons + 1, lessons.length)}/${lessons.length}`
      : !consolidated
        ? "Giai đoạn 3 · Củng cố HSK 1"
        : "Đã xong HSK 1 — chờ HSK 2";

  return { stages, hsk1FinishDate, currentLabel };
}
