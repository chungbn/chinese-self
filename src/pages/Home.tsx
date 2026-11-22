import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Link } from "react-router";
import { db } from "../db/db";
import { useDailyPlan } from "../hooks/useDailyPlan";
import { useRoadmap } from "../hooks/useRoadmap";
import { RoadmapStrip } from "../components/RoadmapStrip";
import { useNow } from "../hooks/useNow";
import { planStatus, type DailyPlan, type PlanTask } from "../lib/plan";
import { computeStreak, dayKey } from "../lib/streak";
import { StreakCalendar } from "../components/StreakCalendar";
import { PageTitle, Stat } from "../components/ui";

export default function Home() {
  const now = useNow();
  const today = dayKey(now);
  const plan = useDailyPlan(now);
  const roadmap = useRoadmap(now);
  const [showCalendar, setShowCalendar] = useState(false);

  const learnedWords = useLiveQuery(async () => new Set(await db.cards.orderBy("wordId").uniqueKeys()).size) ?? 0;
  const completedDays = useLiveQuery(async () => new Set((await db.days.toArray()).filter((d) => d.completed).map((d) => d.key)));
  const todayDone = completedDays?.has(today) ?? false;
  const reviewDays = useLiveQuery(async () => {
    const since = new Date(now);
    since.setDate(since.getDate() - 400);
    const rows = await db.reviews.where("at").aboveOrEqual(since).toArray();
    const byDay = new Map<string, number>();
    for (const r of rows) byDay.set(dayKey(r.at), (byDay.get(dayKey(r.at)) ?? 0) + 1);
    return byDay;
  }, [now.getTime()]);
  const forecast = useLiveQuery(async () => {
    const out: number[] = [];
    for (let i = 1; i <= 7; i++) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() + i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      out.push(await db.cards.where("dueAt").between(start, end).count());
    }
    return out;
  }, [now.getTime()]);

  const todayReviews = reviewDays?.get(today) ?? 0;
  const streak = completedDays ? computeStreak(completedDays, now) : 0;

  return (
    <div className="space-y-4">
      <PageTitle sub={now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}>
        Hôm nay học gì?
      </PageTitle>

      {roadmap && <RoadmapStrip roadmap={roadmap} />}

      {plan ? <PlanCard plan={plan} completedToday={todayDone} /> : <div className="card h-40 animate-pulse" />}

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Từ đã học" value={learnedWords} />
        <Stat label="Lượt ôn hôm nay" value={todayReviews} />
        <button onClick={() => setShowCalendar(true)} className="text-left transition hover:opacity-80" aria-label="Xem lịch hoàn thành">
          <Stat label="Chuỗi hoàn thành ›" value={`${streak} ${todayDone ? "🔥" : "⏳"}`} />
        </button>
      </div>
      {showCalendar && <StreakCalendar now={now} onClose={() => setShowCalendar(false)} />}

      {forecast && (
        <div className="card">
          <div className="mb-2 text-sm text-stone-500">Dự kiến thẻ đến hạn 7 ngày tới</div>
          <div className="flex h-24 items-end gap-2">
            {forecast.map((n, i) => {
              const max = Math.max(1, ...forecast);
              const d = new Date(now);
              d.setDate(d.getDate() + i + 1);
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-stone-500">{n || ""}</span>
                  <div className="w-full rounded-t bg-brand-500/70" style={{ height: `${(n / max) * 56}px` }} />
                  <span className="text-xs text-stone-500">{d.toLocaleDateString("vi-VN", { weekday: "short" })}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reviewDays && <Heatmap byDay={reviewDays} now={now} />}
    </div>
  );
}

function PlanCard({ plan, completedToday }: { plan: DailyPlan; completedToday: boolean }) {
  const { done: doneCount, total, allDone } = planStatus(plan);
  const firstTodo = plan.tasks.find((t) => t.done === false);
  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-medium tracking-wide text-brand-700 uppercase dark:text-brand-500">{plan.phaseLabel}</div>
          <h2 className="text-lg font-semibold">Kế hoạch hôm nay</h2>
        </div>
        <span className="text-sm text-stone-500">
          {doneCount}/{total} việc
        </span>
      </div>
      {plan.progress && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-stone-500">
            <span>Tiến độ HSK 1</span>
            <span>{plan.progress.label}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div className="h-full bg-brand-600" style={{ width: `${(plan.progress.done / plan.progress.total) * 100}%` }} />
          </div>
        </div>
      )}
      <ol className="space-y-2">
        {plan.tasks.map((t, i) => (
          <TaskRow key={t.id} task={t} index={i + 1} highlight={t === firstTodo} />
        ))}
      </ol>
      {(allDone || completedToday) && (
        <p className="rounded-xl bg-green-100 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          {allDone
            ? "Xong kế hoạch hôm nay 🎉 Mai quay lại để giữ chuỗi ngày hoàn thành nhé."
            : "Hôm nay đã được tính hoàn thành ✓ Có thẻ mới đến hạn, ôn thêm nếu bạn còn thời gian."}
        </p>
      )}
      {plan.pace && <p className="text-sm font-medium text-green-700 dark:text-green-400">{plan.pace}</p>}
      {plan.note && <p className="text-sm text-stone-500">{plan.note}</p>}
    </section>
  );
}

function TaskRow({ task, index, highlight }: { task: PlanTask; index: number; highlight: boolean }) {
  const icon =
    task.done === true ? (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm text-white">✓</span>
    ) : task.tone === "blocked" ? (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm text-white">!</span>
    ) : (
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
          task.done === null ? "border-dashed border-stone-300 text-stone-400 dark:border-stone-700" : "border-brand-600 text-brand-700 dark:text-brand-500"
        }`}
      >
        {index}
      </span>
    );
  return (
    <li>
      <Link
        to={task.to}
        className={`flex items-center gap-3 rounded-xl border p-3 transition ${
          highlight
            ? "border-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-800/20 dark:hover:bg-brand-800/30"
            : "border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/50"
        }`}
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className={`block font-medium ${task.done === true ? "text-stone-500 line-through decoration-stone-300" : ""}`}>{task.title}</span>
          {task.detail && task.done !== true && <span className="block text-sm text-stone-500">{task.detail}</span>}
        </span>
        {highlight && <span className="btn-primary shrink-0 px-3 py-1 text-sm">Bắt đầu</span>}
        {!highlight && task.done !== true && <span className="text-stone-400">›</span>}
      </Link>
    </li>
  );
}

function Heatmap({ byDay, now }: { byDay: Map<string, number>; now: Date }) {
  const weeks = 17;
  // Bắt đầu từ thứ Hai của tuần cách đây (weeks - 1) tuần
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);
  const cells: { key: string; n: number; future: boolean }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    cells.push({ key, n: byDay.get(key) ?? 0, future: d > now });
  }
  const level = (n: number) => (n === 0 ? 0 : n < 10 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4);
  const colors = [
    "bg-stone-200 dark:bg-stone-800",
    "bg-brand-100 dark:bg-brand-800/40",
    "bg-brand-500/50",
    "bg-brand-600/80",
    "bg-brand-700",
  ];
  return (
    <div className="card">
      <div className="mb-2 text-sm text-stone-500">Lịch sử học ({weeks} tuần)</div>
      <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key}: ${c.n} lượt ôn`}
            className={`h-3 w-3 rounded-sm ${c.future ? "opacity-0" : colors[level(c.n)]}`}
          />
        ))}
      </div>
    </div>
  );
}
