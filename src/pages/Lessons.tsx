import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router";
import { LESSONS } from "../data";
import { db } from "../db/db";
import { PageTitle } from "../components/ui";

export default function Lessons() {
  const completed = useLiveQuery(() => db.lessons.toArray()) ?? [];
  const done = new Set(completed.map((l) => l.id));
  const levels = [...new Set(LESSONS.map((l) => l.level))];

  return (
    <div>
      <PageTitle sub="Học theo thứ tự. Mỗi bài xong sẽ đưa từ vào lịch ôn tập.">Bài học</PageTitle>
      {levels.map((level) => {
        const lessons = LESSONS.filter((l) => l.level === level);
        const nDone = lessons.filter((l) => done.has(l.id)).length;
        return (
          <section key={level} className="mb-6">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">HSK {level}</h2>
              <span className="text-sm text-stone-500">
                {nDone}/{lessons.length} bài · {lessons.reduce((s, l) => s + l.wordIds.length, 0)} từ
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
              <div className="h-full bg-brand-600" style={{ width: `${(nDone / lessons.length) * 100}%` }} />
            </div>
            <ul className="grid gap-2">
              {lessons.map((l) => (
                <li key={l.id}>
                  <Link to={`/lessons/${l.id}`} className="card flex items-center gap-3 hover:border-brand-500">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${
                        done.has(l.id) ? "bg-green-600 text-white" : "bg-stone-200 dark:bg-stone-800"
                      }`}
                    >
                      {done.has(l.id) ? "✓" : l.order}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{l.title}</span>
                      <span className="text-sm text-stone-500">{l.wordIds.length} từ</span>
                    </span>
                    <span className="text-stone-400">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="text-sm text-stone-500">HSK 1 theo chuẩn HSK 3.0 (bản 2025). HSK 2 trở lên sẽ được bổ sung dần.</p>
    </div>
  );
}
