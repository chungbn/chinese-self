import { DefaultScheduler, Rating, type DefaultScheduler as DefaultSchedulerType } from "ts-fsrs";

export { Rating };

export type Scheduler = DefaultSchedulerType<"FSRS-6">;
export type SrsCard = ReturnType<Scheduler["newCard"]>;
export type Grade = 1 | 2 | 3 | 4;

let schedulerPromise: Promise<Scheduler> | null = null;

/** Một scheduler dùng chung cho cả app (FSRS-6, mục tiêu nhớ 90%). */
export function getScheduler(): Promise<Scheduler> {
  schedulerPromise ??= DefaultScheduler<"FSRS-6">({ version: "FSRS-6" });
  return schedulerPromise;
}

/** Ước lượng khoảng cách tới lần ôn tiếp theo, để hiển thị trên nút chấm điểm. */
export function formatInterval(from: Date, to: Date): string {
  const mins = Math.round((to.getTime() - from.getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} phút`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} tháng`;
  return `${(days / 365).toFixed(1)} năm`;
}
