/**
 * Kế hoạch học mỗi ngày, bám theo lộ trình:
 *  1. Phát âm (tuần 1–2): học pinyin theo chủ đề + luyện nghe mỗi ngày; từ ngày thứ 3 bắt đầu Bài 1 song song.
 *  2. Từ vựng: ôn thẻ đến hạn trước, rồi mỗi ngày 1 bài mới; tạm dừng bài mới khi tồn đọng nhiều thẻ.
 *  3. Củng cố: học hết bài thì chỉ ôn + đọc lại câu ví dụ / ngữ pháp.
 */

export type PinyinTab = "tones" | "sounds" | "sandhi" | "pitfalls" | "drill";

/** Nội dung bài luyện nghe: chỉ thanh điệu, chỉ âm dễ nhầm, hoặc trộn cả hai. */
export type DrillMode = "tones" | "pairs" | "mix";

export const DRILL_MODE_LABEL: Record<DrillMode, string> = {
  tones: "4 thanh",
  pairs: "Âm dễ nhầm",
  mix: "Tổng hợp",
};

/**
 * Chọn chế độ luyện nghe theo những gì đã học: chưa học phần «Lỗi hay gặp» thì chỉ luyện thanh;
 * ngày học phần đó thì luyện âm dễ nhầm; sau đó luyện tổng hợp.
 */
export function drillModeFor(topicToday: PinyinTab | null, topicsSeen: readonly string[]): DrillMode {
  if (topicToday === "pitfalls") return "pairs";
  return topicsSeen.includes("pitfalls") ? "mix" : "tones";
}

/** Phần pinyin nhỏ học trong một ngày (phần thanh mẫu/vận mẫu được chia làm 3 ngày). */
export type PinyinTopic = "tones" | "initials" | "finals-1" | "finals-2" | "pitfalls" | "sandhi";

/** Tab chung của trang Pinyin mà mỗi phần nhỏ thuộc về (dùng cho lộ trình & chế độ luyện nghe). */
export const TOPIC_TAB: Record<PinyinTopic, PinyinTab> = {
  tones: "tones",
  initials: "sounds",
  "finals-1": "sounds",
  "finals-2": "sounds",
  pitfalls: "pitfalls",
  sandhi: "sandhi",
};

/** Nội dung hiển thị trong chế độ tập trung khi bấm vào một việc. */
export type TaskSession =
  | { kind: "pinyin-topic"; topic: PinyinTopic; step: number }
  | { kind: "drill"; mode: DrillMode }
  | { kind: "review" }
  | { kind: "lesson"; lessonId: string }
  | { kind: "reread"; lessonId: string };

export type PlanTask = {
  id: string;
  title: string;
  detail?: string;
  /** Đường dẫn chế độ tập trung: /session/<id> */
  to: string;
  session: TaskSession;
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
  /** Báo khi đang học nhanh hơn nhịp mặc định */
  pace?: string;
};

export type PlanInput = {
  now: Date;
  startedAt: Date;
  pinyinDone: boolean;
  /** Số câu luyện nghe pinyin đã làm hôm nay */
  drillToday: number;
  /** Các bước pinyin đã học xong: phần tử thứ i là ngày (YYYY-MM-DD) học xong bước i của PINYIN_STEPS */
  pinyinSteps: string[];
  /** Các phần pinyin từng học xong (mọi ngày) */
  pinyinTopicsSeen: string[];
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

export type PinyinStep = { topic: PinyinTopic; tab: PinyinTab; title: string; detail: string };

const step = (topic: PinyinTopic, title: string, detail: string): PinyinStep => ({ topic, tab: TOPIC_TAB[topic], title, detail });

/**
 * Các bước học pinyin theo thứ tự, mặc định mỗi ngày một bước.
 * Tiến độ tính theo số bước đã xong (không theo lịch), nên có thể học trước, và nghỉ vài ngày cũng không bị bỏ sót.
 */
export const PINYIN_STEPS: PinyinStep[] = [
  step("tones", "Học 4 thanh điệu", "Nghe từng bộ âm (ma, ba, yi…) và đọc to theo"),
  step("tones", "Ôn lại 4 thanh", "Nghe lại các bộ âm, chú ý thanh 3 và thanh 4"),
  step("initials", "Thanh mẫu (phụ âm đầu)", "23 phụ âm đầu, chú ý cặp bật hơi / không bật hơi"),
  step("finals-1", "Vận mẫu — phần 1", "Vần đơn và vần ghép cơ bản: a, o, e, ai, ao, an, ang…"),
  step("finals-2", "Vận mẫu — phần 2", "Vần bắt đầu bằng i, u, ü: ia, ian, uo, uan, üe…"),
  step("pitfalls", "Các lỗi người Việt hay mắc", "Tập kỹ các cặp zh/z, ch/c, sh/s, b/p, ü"),
  step("pitfalls", "Ôn lại các lỗi hay gặp", "Nghe lại từng cặp âm dễ nhầm và đọc to"),
  step("sandhi", "Quy tắc biến điệu", "3+3, thanh 3 nửa, 不 và 一"),
  step("sandhi", "Ôn lại biến điệu", "Nghe lại ví dụ, tự đọc trước rồi bấm nghe để so"),
];

/** Số bước pinyin đã xong trước hôm nay và trong hôm nay. */
export function pinyinStepState(steps: readonly string[], todayKey: string): { before: number; today: number; total: number } {
  const before = steps.filter((d) => d < todayKey).length;
  return { before, today: steps.length - before, total: steps.length };
}

/**
 * Dựng lại lịch sử bước pinyin từ dữ liệu cũ (các phần đã học theo từng ngày),
 * dùng khi chưa có bản ghi bước. Mỗi ngày mỗi phần chỉ tính một bước.
 */
export function deriveSteps(tabsByDay: readonly { day: string; tabs: readonly string[] }[]): string[] {
  const steps: string[] = [];
  for (const { day, tabs } of [...tabsByDay].sort((a, b) => a.day.localeCompare(b.day))) {
    const used = new Set<string>();
    while (steps.length < PINYIN_STEPS.length) {
      const t = PINYIN_STEPS[steps.length].topic;
      if (used.has(t) || !tabs.includes(t)) break;
      used.add(t);
      steps.push(day);
    }
  }
  return steps;
}

function todayKeyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const sessionPath = (id: string) => `/session/${id}`;

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
      to: sessionPath("review"),
      session: { kind: "review" },
      done: false,
    });
  } else if (totalCards > 0) {
    tasks.push({
      id: "review",
      title: reviewedToday > 0 ? `Đã ôn xong (${reviewedToday} lượt hôm nay)` : "Không có thẻ đến hạn",
      to: sessionPath("review"),
      session: { kind: "review" },
      done: true,
    });
  }

  // 2. Pinyin: bước tiếp theo + luyện nghe hằng ngày cho tới khi nắm vững
  const steps = pinyinStepState(input.pinyinSteps, todayKeyOf(now));
  if (!pinyinDone) {
    // Bước của hôm nay: bước đầu tiên chưa học tính tới hết hôm qua
    const current = PINYIN_STEPS[steps.before];
    const mode = drillModeFor(current?.tab ?? null, input.pinyinTopicsSeen);
    if (current) {
      tasks.push({
        id: "pinyin-topic",
        title: current.title,
        detail: current.detail,
        to: sessionPath("pinyin-topic"),
        session: { kind: "pinyin-topic", topic: current.topic, step: steps.before },
        done: steps.today > 0,
      });
    }
    tasks.push({
      id: "pinyin-drill",
      title: `Luyện nghe: ${DRILL_MODE_LABEL[mode].toLowerCase()} (${Math.min(input.drillToday, DRILL_GOAL)}/${DRILL_GOAL} câu)`,
      detail:
        mode === "tones"
          ? "Nghe một chữ và chọn đúng thanh 1–4"
          : mode === "pairs"
            ? "Nghe và chọn đúng âm trong các cặp zh/z, b/p, an/ang…"
            : "Trộn câu hỏi thanh điệu và âm dễ nhầm",
      to: sessionPath("pinyin-drill"),
      session: { kind: "drill", mode },
      done: input.drillToday >= DRILL_GOAL,
    });
    // Học trước: xong bước hôm nay thì gợi ý bước kế tiếp (tuỳ chọn)
    const ahead = PINYIN_STEPS[steps.total];
    if (steps.today > 0 && ahead) {
      const id = `pinyin-ahead-${steps.total}`;
      tasks.push({
        id,
        title: `Học trước: ${ahead.title}`,
        detail: `${ahead.detail} · tuỳ chọn, phần của ngày mai`,
        to: sessionPath(id),
        session: { kind: "pinyin-topic", topic: ahead.topic, step: steps.total },
        done: null,
      });
    }
  }

  // 3. Bài mới. Bắt đầu Bài 1 từ ngày thứ 3, hoặc sớm hơn nếu đã học trước đủ phần thanh điệu.
  const lessonsUnlocked = pinyinDone || input.completed.length > 0 || day >= LESSON_START_DAY || steps.before >= LESSON_START_DAY;
  const extraLesson = (l: (typeof ordered)[number], label: string): PlanTask => {
    const id = `lesson-extra-${l.order}`;
    return {
      id,
      title: `${label} Bài ${l.order}: ${l.title}`,
      detail:
        dueCount >= EXTRA_LESSON_LIMIT
          ? `${l.wordCount} từ · tuỳ chọn. Còn ${dueCount} thẻ đến hạn, nên ôn trước`
          : `${l.wordCount} từ · tuỳ chọn, chỉ khi bạn còn sức`,
      to: sessionPath(id),
      session: { kind: "lesson", lessonId: l.id },
      done: null,
    };
  };
  if (!lessonsUnlocked) {
    note = `Từ ngày thứ ${LESSON_START_DAY + 1} bạn sẽ bắt đầu Bài 1, học song song với pinyin. Muốn nhanh hơn thì bấm «Học trước».`;
    if (next && steps.today > 0) tasks.push(extraLesson(next, "Học trước"));
  } else if (next) {
    if (doneToday.length > 0) {
      const last = ordered.find((l) => l.id === doneToday[doneToday.length - 1].id);
      tasks.push({
        id: "lesson",
        title: doneToday.length > 1 ? `Đã học ${doneToday.length} bài, mới nhất Bài ${last?.order}` : `Đã học Bài ${last?.order}: ${last?.title}`,
        to: sessionPath("lesson"),
        session: { kind: "lesson", lessonId: last?.id ?? next.id },
        done: true,
      });
      // Học trước bài tiếp theo: luôn cho phép, trừ khi tồn đọng quá nhiều thẻ
      if (dueCount <= BACKLOG_LIMIT) tasks.push(extraLesson(next, "Học trước"));
    } else if (dueCount > BACKLOG_LIMIT) {
      tasks.push({
        id: "lesson",
        title: `Tạm dừng bài mới (Bài ${next.order})`,
        detail: `Còn ${dueCount} thẻ cần ôn. Ôn bớt xuống dưới ${BACKLOG_LIMIT} rồi học tiếp`,
        to: sessionPath("lesson"),
        session: { kind: "review" },
        done: false,
        tone: "blocked",
      });
    } else {
      tasks.push({
        id: "lesson",
        title: `Học Bài ${next.order}: ${next.title}`,
        detail: `${next.wordCount} từ mới · ngữ pháp → học từ → quiz`,
        to: sessionPath("lesson"),
        session: { kind: "lesson", lessonId: next.id },
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
        to: sessionPath("reread"),
        session: { kind: "reread", lessonId: l.id },
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

  // So với nhịp mặc định (1 bước pinyin + 1 bài mỗi ngày): chỉ báo khi đang đi trước
  const expectedLessons = Math.max(0, day - LESSON_START_DAY + (doneToday.length > 0 ? 1 : 0));
  const lessonsAhead = doneIds.size - expectedLessons;
  const stepsAhead = steps.total - Math.min(PINYIN_STEPS.length, day + (steps.today > 0 ? 1 : 0));
  const pace =
    lessonsAhead > 0
      ? `Đang đi trước lộ trình ${lessonsAhead} bài 🚀`
      : stepsAhead > 0 && !pinyinDone
        ? `Đang đi trước lộ trình ${stepsAhead} phần pinyin 🚀`
        : undefined;

  return { phase, phaseLabel, progress, tasks, note, pace };
}

/** Số việc bắt buộc đã xong / tổng số (việc tuỳ chọn không tính). */
export function planStatus(plan: DailyPlan): { done: number; total: number; allDone: boolean } {
  const required = plan.tasks.filter((t) => t.done !== null);
  const done = required.filter((t) => t.done).length;
  return { done, total: required.length, allDone: required.length > 0 && done === required.length };
}
