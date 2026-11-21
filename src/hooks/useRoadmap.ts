import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { LESSONS, WORDS } from "../data";
import { ensureStartedAt } from "../db/actions";
import { db, SKILLS } from "../db/db";
import { buildRoadmap, MASTERED_DAYS, type Roadmap } from "../lib/roadmap";

const LESSON_INFO = LESSONS.map((l) => ({ id: l.id, order: l.order, title: l.title, wordCount: l.wordIds.length }));

export function useRoadmap(now: Date): Roadmap | null {
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  useEffect(() => {
    ensureStartedAt().then(setStartedAt);
  }, []);

  const data = useLiveQuery(async () => {
    const [pinyinDone, drills, tabs, completed, cards] = await Promise.all([
      db.meta.get("pinyinDone"),
      db.meta.where("key").startsWith("drill:").toArray(),
      db.meta.where("key").startsWith("pinyinTabs:").toArray(),
      db.lessons.toArray(),
      db.cards.toArray(),
    ]);
    // Từ thuộc vững: cả 3 kỹ năng đều có khoảng ôn ≥ MASTERED_DAYS ngày
    const byWord = new Map<string, number[]>();
    for (const c of cards) {
      const arr = byWord.get(c.wordId) ?? [];
      arr.push(c.srs.scheduledDays);
      byWord.set(c.wordId, arr);
    }
    let mastered = 0;
    for (const days of byWord.values()) if (days.length === SKILLS.length && days.every((d) => d >= MASTERED_DAYS)) mastered++;
    return {
      pinyinDone: pinyinDone?.value === true,
      drillTotal: drills.reduce((s, r) => s + ((r.value as number) ?? 0), 0),
      pinyinTopicsSeen: [...new Set(tabs.flatMap((r) => (r.value as string[]) ?? []))],
      completed,
      learnedWords: byWord.size,
      masteredWords: mastered,
    };
  });

  if (!startedAt || !data) return null;
  return buildRoadmap({ now, startedAt, lessons: LESSON_INFO, totalWords: WORDS.filter((w) => w.level === 1).length, ...data });
}
