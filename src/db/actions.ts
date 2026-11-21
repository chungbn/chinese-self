import { LESSON_BY_ID } from "../data";
import { getScheduler, type Grade } from "../srs/scheduler";
import { db, SKILLS, type CardRow, type LessonRow, type ReviewRow } from "./db";

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
};

export async function exportBackup(): Promise<string> {
  const data: Backup = {
    app: "chinese-self",
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: await db.cards.toArray(),
    reviews: await db.reviews.toArray(),
    lessons: await db.lessons.toArray(),
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
  await db.transaction("rw", db.cards, db.reviews, db.lessons, async () => {
    await Promise.all([db.cards.clear(), db.reviews.clear(), db.lessons.clear()]);
    await db.cards.bulkAdd(cards);
    await db.reviews.bulkAdd(reviews);
    await db.lessons.bulkAdd(lessons);
  });
}

export async function resetAll(): Promise<void> {
  await db.transaction("rw", db.cards, db.reviews, db.lessons, async () => {
    await Promise.all([db.cards.clear(), db.reviews.clear(), db.lessons.clear()]);
  });
}

// ---------- Thống kê ----------

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Số ngày học liên tiếp tính đến hôm nay (hoặc hôm qua nếu hôm nay chưa học). */
export function computeStreak(reviewDays: Set<string>, today = new Date()): number {
  const cursor = new Date(today);
  if (!reviewDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (reviewDays.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
