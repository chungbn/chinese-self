import Dexie, { type EntityTable } from "dexie";
import type { SrsCard } from "../srs/scheduler";

/** Kỹ năng được ôn cho mỗi từ. */
export type Skill = "recognize" | "recall" | "listen";
export const SKILLS: Skill[] = ["recognize", "recall", "listen"];
export const SKILL_LABEL: Record<Skill, string> = {
  recognize: "Nhận mặt chữ",
  recall: "Nhớ lại & gõ",
  listen: "Nghe & gõ",
};

export type CardRow = {
  /** `${wordId}:${skill}` */
  id: string;
  wordId: string;
  skill: Skill;
  dueAt: Date;
  srs: SrsCard;
  createdAt: Date;
};

export type ReviewRow = {
  id?: number;
  cardId: string;
  wordId: string;
  skill: Skill;
  grade: number;
  at: Date;
};

export type LessonRow = { id: string; completedAt: Date };

export type MetaRow = { key: string; value: unknown };

/** Kết quả kế hoạch học của một ngày. */
export type DayRow = {
  /** "YYYY-MM-DD" theo giờ máy */
  key: string;
  completed: boolean;
  tasksDone: number;
  tasksTotal: number;
  completedAt?: Date;
  updatedAt: Date;
};

export const db = new Dexie("chinese-self") as Dexie & {
  cards: EntityTable<CardRow, "id">;
  reviews: EntityTable<ReviewRow, "id">;
  lessons: EntityTable<LessonRow, "id">;
  meta: EntityTable<MetaRow, "key">;
  days: EntityTable<DayRow, "key">;
};

db.version(1).stores({
  cards: "id, wordId, skill, dueAt",
  reviews: "++id, cardId, wordId, at",
  lessons: "id",
  meta: "key",
});

db.version(2).stores({
  days: "key",
});
