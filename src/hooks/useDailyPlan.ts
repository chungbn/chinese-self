import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { LESSONS } from "../data";
import { ensureStartedAt } from "../db/actions";
import { db } from "../db/db";
import { buildDailyPlan, type DailyPlan, type PinyinTab } from "../lib/plan";
import { dayKey } from "../lib/streak";

const LESSON_INFO = LESSONS.map((l) => ({ id: l.id, order: l.order, title: l.title, wordCount: l.wordIds.length }));

/** Kế hoạch học hôm nay, tự cập nhật khi dữ liệu thay đổi. null khi đang tải. */
export function useDailyPlan(now: Date): DailyPlan | null {
  const today = dayKey(now);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  useEffect(() => {
    ensureStartedAt().then(setStartedAt);
  }, []);

  const data = useLiveQuery(async () => {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const [dueCount, totalCards, reviewedToday, completed, pinyinDone, drill, tabs] = await Promise.all([
      db.cards.where("dueAt").belowOrEqual(now).count(),
      db.cards.count(),
      db.reviews.where("at").aboveOrEqual(startOfDay).count(),
      db.lessons.toArray(),
      db.meta.get("pinyinDone"),
      db.meta.get(`drill:${today}`),
      db.meta.get(`pinyinTabs:${today}`),
    ]);
    return {
      dueCount,
      totalCards,
      reviewedToday,
      completed,
      pinyinDone: pinyinDone?.value === true,
      drillToday: (drill?.value as number | undefined) ?? 0,
      pinyinTabsToday: (tabs?.value as PinyinTab[] | undefined) ?? [],
    };
  }, [now.getTime(), today]);

  if (!startedAt || !data) return null;
  return buildDailyPlan({ now, startedAt, lessons: LESSON_INFO, ...data });
}
