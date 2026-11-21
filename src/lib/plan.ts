/**
 * Kế hoạch học mỗi ngày, bám theo lộ trình:
 *  1. Phát âm (tuần 1–2): học pinyin theo chủ đề + luyện nghe mỗi ngày; từ ngày thứ 3 bắt đầu Bài 1 song song.
 *  2. Từ vựng: ôn thẻ đến hạn trước, rồi mỗi ngày 1 bài mới; tạm dừng bài mới khi tồn đọng nhiều thẻ.
 *  3. Củng cố: học hết bài thì chỉ ôn + đọc lại câu ví dụ / ngữ pháp.
 */

export type PinyinTab = "tones" | "sounds" | "sandhi" | "pitfalls" | "drill";

export type PlanTask = {
  id: string;
  title: string;
  detail?: string;
  to: string;
  /** true = đã xong hôm nay; false = cần làm; null = gợi ý tuỳ chọn */
  done: boolean | null;
  /** "blocked": việc tạm hoãn kèm lý do */
  tone?: "blocked";
};

export type PlanPhase = "pinyin" | "vocab" | "consolidate";

export type DailyPlan = {
  phase: PlanPhase;
  phaseLabel: string;
  progress?: { done: number; total: number; label: string };
  tasks: PlanTask[];
  note?: string;
};

export type PlanInput = {
  now: Date;
  startedAt: Date;
  pinyinDone: boolean;
  /** Số câu luyện nghe pinyin đã làm hôm nay */
  drillToday: number;
  /** Các tab pinyin đã mở hôm nay */
  pinyinTabsToday: PinyinTab[];
  dueCount: number;
  /** Tổng số thẻ đã có trong lịch ôn */
  totalCards: number;
  reviewedToday: number;
  lessons: { id: string; order: number; title: string; wordCount: number }[];
  completed: { id: string; completedAt: Date }[];
};

export const DRILL_GOAL = 20;
/** Quá số thẻ đến hạn này thì tạm dừng học bài mới */
export const BACKLOG_LIMIT = 60;
/** Dưới số thẻ này thì cho phép học thêm bài thứ hai trong ngày */
export const EXTRA_LESSON_LIMIT = 20;
/** Từ ngày thứ mấy (tính từ 0) bắt đầu học Bài 1 khi chưa xong pinyin */
export const LESSON_START_DAY = 2;
export const PINYIN_PHASE_DAYS = 14;

const DAY_MS = 86_400_000;

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS));
}

/** Chủ đề pinyin gợi ý theo ngày học. */
export function pinyinTopicForDay(day: number): { tab: PinyinTab; title: string; detail: string } {
  if (day <= 1) return { tab: "tones", title: "Học 4 thanh điệu", detail: "Nghe từng bộ âm (ma, ba, yi…) và đọc to theo" };
  if (day <= 4) return { tab: "sounds", title: "Thanh mẫu & vận mẫu", detail: "Mỗi ngày nghe và đọc theo khoảng 1/3 bảng" };
  if (day <= 6) return { tab: "pitfalls", title: "Các lỗi người Việt hay mắc", detail: "Tập kỹ các cặp zh/z, ch/c, sh/s, b/p, ü" };
  if (day <= 8) return { tab: "sandhi", title: "Quy tắc biến điệu", detail: "3+3, thanh 3 nửa, 不 và 一" };
  return { tab: "tones", title: "Ôn lại 4 thanh", detail: "Nghe lại các bộ âm, chú ý thanh 3 và thanh 4" };
}

export function buildDailyPlan(input: PlanInput): DailyPlan {
  const { now, dueCount, totalCards, reviewedToday, pinyinDone } = input;
  const day = daysBetween(input.startedAt, now);
  const today = startOfDay(now);
  const doneIds = new Set(input.completed.map((c) => c.id));
  const doneToday = input.completed.filter((c) => startOfDay(c.completedAt) === today);
  const ordered = [...input.lessons].sort((a, b) => a.order - b.order);
  const remaining = ordered.filter((l) => !doneIds.has(l.id));
  const next = remaining[0];

  const phase: PlanPhase =
    !pinyinDone && input.completed.length === 0 && day < PINYIN_PHASE_DAYS
      ? "pinyin"
      : remaining.length > 0
        ? "vocab"
        : "consolidate";

  const tasks: PlanTask[] = [];
  let note: string | undefined;

  // 1. Ôn tập luôn đứng đầu
  if (dueCount > 0) {
    tasks.push({
      id: "review",
      title: `Ôn ${dueCount} thẻ đến hạn`,
      detail: "Làm trước khi học bài mới",
      to: "/review",
      done: false,
    });
  } else if (totalCards > 0) {
    tasks.push({
      id: "review",
      title: reviewedToday > 0 ? `Đã ôn xong (${reviewedToday} lượt hôm nay)` : "Không có thẻ đến hạn",
      to: "/review",
      done: true,
    });
  }

  // 2. Pinyin: chủ đề trong giai đoạn phát âm + luyện nghe hằng ngày cho tới khi nắm vững
  if (!pinyinDone) {
    if (phase === "pinyin") {
      const topic = pinyinTopicForDay(day);
      tasks.push({
        id: "pinyin-topic",
        title: topic.title,
        detail: topic.detail,
        to: `/pinyin?tab=${topic.tab}`,
        done: input.pinyinTabsToday.includes(topic.tab),
      });
    }
    tasks.push({
      id: "pinyin-drill",
      title: `Luyện nghe thanh điệu (${Math.min(input.drillToday, DRILL_GOAL)}/${DRILL_GOAL} câu)`,
      detail: "Nghe và chọn thanh / chọn âm đúng",
      to: "/pinyin?tab=drill",
      done: input.drillToday >= DRILL_GOAL,
    });
  }

  // 3. Bài mới
  if (phase === "pinyin" && day < LESSON_START_DAY) {
    note = `Từ ngày thứ ${LESSON_START_DAY + 1} bạn sẽ bắt đầu Bài 1, học song song với pinyin.`;
  } else if (next) {
    if (doneToday.length > 0) {
      const last = ordered.find((l) => l.id === doneToday[doneToday.length - 1].id);
      tasks.push({
        id: "lesson",
        title: `Đã học Bài ${last?.order}: ${last?.title}`,
        to: `/lessons/${last?.id}`,
        done: true,
      });
      if (dueCount < EXTRA_LESSON_LIMIT) {
        tasks.push({
          id: "lesson-extra",
          title: `Học thêm Bài ${next.order}: ${next.title}`,
          detail: `${next.wordCount} từ · tuỳ chọn, chỉ khi bạn còn sức`,
          to: `/lessons/${next.id}`,
          done: null,
        });
      }
    } else if (dueCount > BACKLOG_LIMIT) {
      tasks.push({
        id: "lesson",
        title: `Tạm dừng bài mới (Bài ${next.order})`,
        detail: `Còn ${dueCount} thẻ cần ôn. Ôn bớt xuống dưới ${BACKLOG_LIMIT} rồi học tiếp`,
        to: "/review",
        done: false,
        tone: "blocked",
      });
    } else {
      tasks.push({
        id: "lesson",
        title: `Học Bài ${next.order}: ${next.title}`,
        detail: `${next.wordCount} từ mới · xem thẻ → quiz → vào lịch ôn`,
        to: `/lessons/${next.id}`,
        done: false,
      });
    }
  } else {
    // Củng cố: mỗi ngày đọc lại một bài, xoay vòng
    const l = ordered[day % ordered.length];
    if (l) {
      tasks.push({
        id: "reread",
        title: `Đọc lại Bài ${l.order}: ${l.title}`,
        detail: "Đọc to câu ví dụ, tự đặt câu theo mẫu ngữ pháp",
        to: `/lessons/${l.id}`,
        done: null,
      });
    }
    note = "Bạn đã học hết các bài hiện có. Hãy ôn đều mỗi ngày và làm thử đề HSK 1.";
  }

  const phaseLabel =
    phase === "pinyin"
      ? `Giai đoạn 1 · Phát âm — ngày ${day + 1}`
      : phase === "vocab"
        ? "Giai đoạn 2 · Từ vựng HSK 1"
        : "Giai đoạn 3 · Củng cố HSK 1";

  const progress =
    phase === "pinyin"
      ? undefined
      : { done: doneIds.size, total: ordered.length, label: `${doneIds.size}/${ordered.length} bài` };

  return { phase, phaseLabel, progress, tasks, note };
}
