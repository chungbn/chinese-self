import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { db, type DayRow } from "../db/db";
import { bestStreak, computeStreak, dayKey, parseDayKey } from "../lib/streak";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type Status = "done" | "partial" | "missed" | "today" | "none";

function statusOf(key: string, row: DayRow | undefined, todayKey: string, startKey: string): Status {
  if (row?.completed) return "done";
  if (key === todayKey) return "today";
  if (key > todayKey || key < startKey) return "none";
  return row ? "partial" : "missed";
}

const STYLE: Record<Status, string> = {
  done: "bg-green-600 text-white",
  partial: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  missed: "bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400",
  today: "ring-2 ring-brand-600 text-brand-700 dark:text-brand-500",
  none: "text-stone-300 dark:text-stone-700",
};

export function StreakCalendar({ onClose, now }: { onClose: () => void; now: Date }) {
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const rows = useLiveQuery(() => db.days.toArray()) ?? [];
  const startedAt = useLiveQuery(() => db.meta.get("startedAt"))?.value as string | undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const byKey = new Map(rows.map((r) => [r.key, r]));
  const completedDays = new Set(rows.filter((r) => r.completed).map((r) => r.key));
  const todayKey = dayKey(now);
  const startKey = startedAt ? dayKey(new Date(startedAt)) : todayKey;

  // Lưới tháng, tuần bắt đầu từ thứ Hai
  const first = new Date(month);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => dayKey(new Date(month.getFullYear(), month.getMonth(), i + 1))),
  ];

  const monthKeys = cells.filter((k): k is string => !!k);
  const doneThisMonth = monthKeys.filter((k) => completedDays.has(k)).length;
  const countedThisMonth = monthKeys.filter((k) => k >= startKey && k <= todayKey).length;
  const startMonth = parseDayKey(startKey);
  const canPrev = month > new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
  const canNext = month < new Date(now.getFullYear(), now.getMonth(), 1);

  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label="Lịch hoàn thành kế hoạch">
      <div className="card w-full max-w-md space-y-4 rounded-b-none pb-8 sm:rounded-b-2xl sm:pb-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chuỗi ngày hoàn thành</h2>
          <button className="text-2xl leading-none text-stone-400 hover:text-stone-600" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
            <div className="text-2xl font-bold">{computeStreak(completedDays, now)} 🔥</div>
            <div className="text-xs text-stone-500">Chuỗi hiện tại</div>
          </div>
          <div className="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
            <div className="text-2xl font-bold">{bestStreak(completedDays)}</div>
            <div className="text-xs text-stone-500">Dài nhất</div>
          </div>
          <div className="rounded-xl bg-stone-100 p-2 dark:bg-stone-800">
            <div className="text-2xl font-bold">{completedDays.size}</div>
            <div className="text-xs text-stone-500">Tổng ngày xong</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button className="btn-ghost px-3 py-1" disabled={!canPrev} onClick={() => shift(-1)} aria-label="Tháng trước">
            ‹
          </button>
          <div className="text-center">
            <div className="font-semibold">
              Tháng {month.getMonth() + 1}/{month.getFullYear()}
            </div>
            <div className="text-xs text-stone-500">
              Hoàn thành {doneThisMonth}/{countedThisMonth} ngày
            </div>
          </div>
          <button className="btn-ghost px-3 py-1" disabled={!canNext} onClick={() => shift(1)} aria-label="Tháng sau">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 text-xs font-medium text-stone-500">
              {w}
            </div>
          ))}
          {cells.map((k, i) => {
            if (!k) return <div key={`e${i}`} />;
            const row = byKey.get(k);
            const st = statusOf(k, row, todayKey, startKey);
            const label =
              st === "done"
                ? "Hoàn thành"
                : st === "partial"
                  ? `Chưa hoàn thành (${row?.tasksDone}/${row?.tasksTotal} việc)`
                  : st === "missed"
                    ? "Không học"
                    : st === "today"
                      ? `Hôm nay${row ? ` (${row.tasksDone}/${row.tasksTotal} việc)` : ""}`
                      : "";
            return (
              <div key={k} title={label ? `${k}: ${label}` : k} className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm ${STYLE[st]}`}>
                <span className="font-medium">{parseDayKey(k).getDate()}</span>
                {st === "done" && <span className="text-[10px] leading-none">✓</span>}
                {st === "partial" && <span className="text-[10px] leading-none">{row?.tasksDone}/{row?.tasksTotal}</span>}
                {st === "today" && row && <span className="text-[10px] leading-none">{row.tasksDone}/{row.tasksTotal}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
          <Legend cls={STYLE.done} text="Hoàn thành" />
          <Legend cls={STYLE.partial} text="Chưa hoàn thành" />
          <Legend cls={STYLE.missed} text="Không học" />
          <Legend cls={STYLE.today} text="Hôm nay" />
        </div>
        <p className="text-xs text-stone-500">
          Một ngày được tính là hoàn thành khi bạn làm xong mọi việc bắt buộc trong «Kế hoạch hôm nay». Hôm nay chưa xong thì chuỗi vẫn giữ tới hết ngày.
        </p>
      </div>
    </div>
  );
}

function Legend({ cls, text }: { cls: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-3 w-3 rounded ${cls}`} />
      {text}
    </span>
  );
}
