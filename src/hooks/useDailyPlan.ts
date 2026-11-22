import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { LESSONS } from "../data";
import { ensureStartedAt, loadPinyinSteps } from "../db/actions";
import { db } from "../db/db";
import { buildDailyPlan, type DailyPlan } from "../lib/plan";
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
    const [dueCount, totalCards, reviewedToday, completed, pinyinDone, drill, pinyinSteps, allTabs] = await Promise.all([
      // Dùng thời điểm thực lúc truy vấn: thẻ vừa tạo (đến hạn ngay) phải được tính luôn
      db.cards.where("dueAt").belowOrEqual(new Date()).count(),
      db.cards.count(),
      db.reviews.where("at").aboveOrEqual(startOfDay).count(),
      db.lessons.toArray(),
      db.meta.get("pinyinDone"),
      db.meta.get(`drill:${today}`),
      loadPinyinSteps(),
      db.meta.where("key").startsWith("pinyinTabs:").toArray(),
    ]);
    return {
      dueCount,
      totalCards,
      reviewedToday,
      completed,
      pinyinDone: pinyinDone?.value === true,
      drillToday: (drill?.value as number | undefined) ?? 0,
      pinyinSteps,
      pinyinTopicsSeen: [...new Set(allTabs.flatMap((r) => (r.value as string[]) ?? []))],
    };
  }, [now.getTime(), today]);

  if (!startedAt || !data) return null;
  return buildDailyPlan({ now, startedAt, lessons: LESSON_INFO, ...data });
}
