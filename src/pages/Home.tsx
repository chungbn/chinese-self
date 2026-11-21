import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router";
import { LESSONS } from "../data";
import { computeStreak, dayKey } from "../db/actions";
import { db } from "../db/db";
import { useNow } from "../hooks/useNow";
import { PageTitle, Stat } from "../components/ui";

export default function Home() {
  const now = useNow();
  const dueCount = useLiveQuery(() => db.cards.where("dueAt").belowOrEqual(now).count(), [now.getTime()]) ?? 0;
  const learnedWords = useLiveQuery(async () => new Set(await db.cards.orderBy("wordId").uniqueKeys()).size) ?? 0;
  const completed = useLiveQuery(() => db.lessons.toArray()) ?? [];
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

  const doneIds = new Set(completed.map((l) => l.id));
  const nextLesson = LESSONS.find((l) => !doneIds.has(l.id));
  const todayReviews = reviewDays?.get(dayKey(now)) ?? 0;
  const streak = reviewDays ? computeStreak(new Set(reviewDays.keys()), now) : 0;

  const pinyinDone = (useLiveQuery(() => db.meta.get("pinyinDone")) ?? null)?.value === true;

  return (
    <div className="space-y-4">
      <PageTitle sub={now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}>
        Hôm nay học gì?
      </PageTitle>

      {!pinyinDone && learnedWords === 0 && (
        <Link to="/pinyin" className="card block border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950">
          <div className="font-semibold">Bước 1: Pinyin & thanh điệu</div>
          <div className="text-sm text-stone-600 dark:text-stone-400">
            Mới bắt đầu? Học phát âm và 4 thanh trước khi học từ vựng (khoảng 2–4 tuần, có thể song song).
          </div>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/review" className="card flex flex-col gap-1 hover:border-brand-500">
          <span className="text-sm text-stone-500">Thẻ cần ôn</span>
          <span className="text-4xl font-bold text-brand-700 dark:text-brand-500">{dueCount}</span>
          <span className="btn-primary mt-2 self-start">{dueCount > 0 ? "Ôn tập ngay" : "Không có thẻ đến hạn"}</span>
        </Link>
        {nextLesson ? (
          <Link to={`/lessons/${nextLesson.id}`} className="card flex flex-col gap-1 hover:border-brand-500">
            <span className="text-sm text-stone-500">Bài tiếp theo · HSK {nextLesson.level}</span>
            <span className="text-xl font-semibold">
              Bài {nextLesson.order}: {nextLesson.title}
            </span>
            <span className="text-sm text-stone-500">{nextLesson.wordIds.length} từ mới</span>
            <span className="btn-ghost mt-2 self-start">Học bài mới</span>
          </Link>
        ) : (
          <div className="card">Bạn đã học hết các bài hiện có 🎉</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Từ đã học" value={learnedWords} />
        <Stat label="Lượt ôn hôm nay" value={todayReviews} />
        <Stat label="Chuỗi ngày" value={`${streak} 🔥`} />
      </div>

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
