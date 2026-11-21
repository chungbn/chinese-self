import { LESSON_BY_ID } from "../data";
import { getScheduler, type Grade } from "../srs/scheduler";
import { dayKey } from "../lib/streak";
import { db, SKILLS, type CardRow, type DayRow, type LessonRow, type ReviewRow } from "./db";

export { dayKey };

/** Đánh dấu hoàn thành bài và đưa các từ vào lịch ôn (bỏ qua thẻ đã có). */
export async function completeLesson(lessonId: string): Promise<number> {
  const lesson = LESSON_BY_ID.get(lessonId);
  if (!lesson) throw new Error(`Unknown lesson ${lessonId}`);
  const scheduler = await getScheduler();
  const now = new Date();
  let added = 0;
  await db.transaction("rw", db.cards, db.lessons, async () => {
    for (const wordId of lesson.wordIds) {
      for (const skill of SKILLS) {
        const id = `${wordId}:${skill}`;
        if (await db.cards.get(id)) continue;
        const srs = scheduler.newCard({ cardId: id, now });
        await db.cards.add({ id, wordId, skill, dueAt: srs.dueAt, srs, createdAt: now });
        added++;
      }
    }
    await db.lessons.put({ id: lessonId, completedAt: now });
  });
  return added;
}

/** Chấm một thẻ, lưu trạng thái mới và nhật ký. Trả về thẻ đã cập nhật. */
export async function reviewCard(card: CardRow, grade: Grade, now = new Date()): Promise<CardRow> {
  const scheduler = await getScheduler();
  const { card: srs } = scheduler.review({ card: card.srs, grade, now });
  const updated: CardRow = { ...card, srs, dueAt: srs.dueAt };
  await db.transaction("rw", db.cards, db.reviews, async () => {
    await db.cards.put(updated);
    await db.reviews.add({ cardId: card.id, wordId: card.wordId, skill: card.skill, grade, at: now });
  });
  return updated;
}

/** Xem trước ngày ôn tiếp theo cho từng mức điểm. */
export async function previewCard(card: CardRow, now = new Date()): Promise<Record<Grade, Date>> {
  const scheduler = await getScheduler();
  const out = {} as Record<Grade, Date>;
  for (const p of scheduler.preview({ card: card.srs, now })) out[p.grade as Grade] = p.card.dueAt;
  return out;
}

// ---------- Sao lưu ----------

type Backup = {
  app: "chinese-self";
  version: 1;
  exportedAt: string;
  cards: CardRow[];
  reviews: ReviewRow[];
  lessons: LessonRow[];
  days?: DayRow[];
};

export async function exportBackup(): Promise<string> {
  const data: Backup = {
    app: "chinese-self",
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: await db.cards.toArray(),
    reviews: await db.reviews.toArray(),
    lessons: await db.lessons.toArray(),
    days: await db.days.toArray(),
  };
  return JSON.stringify(data);
}

const d = (v: unknown) => (v == null ? v : new Date(v as string));

export async function importBackup(json: string): Promise<void> {
  const data = JSON.parse(json) as Backup;
  if (data.app !== "chinese-self") throw new Error("File không phải bản sao lưu của chinese-self");
  const cards = data.cards.map((c) => ({
    ...c,
    dueAt: d(c.dueAt) as Date,
    createdAt: d(c.createdAt) as Date,
    srs: { ...c.srs, dueAt: d(c.srs.dueAt), lastReviewAt: d(c.srs.lastReviewAt) },
  })) as CardRow[];
  const reviews = data.reviews.map((r) => ({ ...r, at: d(r.at) as Date }));
  const lessons = data.lessons.map((l) => ({ ...l, completedAt: d(l.completedAt) as Date }));
  const days = (data.days ?? []).map((x) => ({
    ...x,
    updatedAt: d(x.updatedAt) as Date,
    completedAt: (d(x.completedAt) ?? undefined) as Date | undefined,
  }));
  await db.transaction("rw", [db.cards, db.reviews, db.lessons, db.days], async () => {
    await Promise.all([db.cards.clear(), db.reviews.clear(), db.lessons.clear(), db.days.clear()]);
    await db.cards.bulkAdd(cards);
    await db.reviews.bulkAdd(reviews);
    await db.lessons.bulkAdd(lessons);
    await db.days.bulkAdd(days);
  });
}

export async function resetAll(): Promise<void> {
  await db.transaction("rw", [db.cards, db.reviews, db.lessons, db.days, db.meta], async () => {
    await Promise.all([db.cards.clear(), db.reviews.clear(), db.lessons.clear(), db.days.clear(), db.meta.clear()]);
  });
}

/**
 * Ghi tiến độ kế hoạch của một ngày. Đã hoàn thành thì giữ nguyên (không bị «rớt» khi
 * có thẻ mới đến hạn sau đó trong ngày).
 */
export async function recordDayProgress(key: string, tasksDone: number, tasksTotal: number, now = new Date()): Promise<void> {
  await db.transaction("rw", db.days, async () => {
    const row = await db.days.get(key);
    const nowComplete = tasksTotal > 0 && tasksDone >= tasksTotal;
    if (row?.completed) {
      if (row.tasksDone !== tasksDone || row.tasksTotal !== tasksTotal)
        await db.days.put({ ...row, tasksDone: Math.max(row.tasksDone, tasksDone), tasksTotal: row.tasksTotal, updatedAt: now });
      return;
    }
    if (row && row.tasksDone === tasksDone && row.tasksTotal === tasksTotal && !nowComplete) return;
    await db.days.put({
      key,
      completed: nowComplete,
      tasksDone,
      tasksTotal,
      completedAt: nowComplete ? now : undefined,
      updatedAt: now,
    });
  });
}

// ---------- Thống kê ----------

// ---------- Theo dõi việc học pinyin trong ngày (cho kế hoạch hằng ngày) ----------

export async function incrementDrill(now = new Date()): Promise<void> {
  const key = `drill:${dayKey(now)}`;
  await db.transaction("rw", db.meta, async () => {
    const cur = ((await db.meta.get(key))?.value as number | undefined) ?? 0;
    await db.meta.put({ key, value: cur + 1 });
  });
}

export async function recordPinyinTab(tab: string, now = new Date()): Promise<void> {
  const key = `pinyinTabs:${dayKey(now)}`;
  await db.transaction("rw", db.meta, async () => {
    const cur = ((await db.meta.get(key))?.value as string[] | undefined) ?? [];
    if (!cur.includes(tab)) await db.meta.put({ key, value: [...cur, tab] });
  });
}

/** Ngày bắt đầu học: lưu lần đầu mở app (hoặc lấy ngày hoàn thành bài sớm nhất nếu có). */
export async function ensureStartedAt(now = new Date()): Promise<Date> {
  const row = await db.meta.get("startedAt");
  if (row) return new Date(row.value as string);
  const lessons = await db.lessons.toArray();
  const earliest = lessons.reduce((min, l) => (l.completedAt < min ? l.completedAt : min), now);
  await db.meta.put({ key: "startedAt", value: earliest.toISOString() });
  return earliest;
}
