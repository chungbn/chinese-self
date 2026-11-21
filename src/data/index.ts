import { HSK1_LESSONS, HSK1_WORDS } from "./hsk1";
import type { Lesson, Word } from "./types";

export const LESSONS: Lesson[] = [...HSK1_LESSONS];
export const WORDS: Word[] = [...HSK1_WORDS];

export const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

export function getWord(id: string): Word {
  const w = WORD_BY_ID.get(id);
  if (!w) throw new Error(`Unknown word ${id}`);
  return w;
}

export type { Lesson, Word };
