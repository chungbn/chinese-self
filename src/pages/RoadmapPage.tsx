import { useState } from "react";
import { Link } from "react-router";
import { useNow } from "../hooks/useNow";
import { useRoadmap } from "../hooks/useRoadmap";
import type { RoadmapLesson, RoadmapStage, StageStatus } from "../lib/roadmap";
import { PageTitle } from "../components/ui";

const fmt = (d: Date) => d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" });

const DOT: Record<StageStatus, string> = {
  done: "bg-green-600 text-white border-green-600",
  current: "bg-brand-700 text-white border-brand-700 ring-4 ring-brand-500/25",
  upcoming: "bg-white text-stone-500 border-stone-300 dark:bg-stone-900 dark:border-stone-700",
  locked: "bg-stone-100 text-stone-400 border-stone-200 dark:bg-stone-900 dark:border-stone-800",
};

const BADGE: Record<StageStatus, { text: string; cls: string }> = {
  done: { text: "Đã xong", cls: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  current: { text: "Bạn đang ở đây", cls: "bg-brand-100 text-brand-800 dark:bg-brand-800/30 dark:text-brand-500" },
  upcoming: { text: "Sắp tới", cls: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400" },
  locked: { text: "Sắp có trong app", cls: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500" },
};

export default function RoadmapPage() {
  const now = useNow();
  const roadmap = useRoadmap(now);
  if (!roadmap) return <div className="card h-64 animate-pulse" />;

  return (
    <div className="space-y-4">
      <PageTitle sub="Toàn bộ chặng đường từ con số 0. Mỗi ngày làm theo «Kế hoạch hôm nay» ở trang chủ là sẽ đi đúng lộ trình này.">
        Lộ trình học
      </PageTitle>

      <div className="card flex flex-wrap items-center justify-between gap-2 border-brand-600">
        <div>
          <div className="text-xs text-stone-500">Bạn đang ở</div>
          <div className="font-semibold">{roadmap.currentLabel}</div>
        </div>
        {roadmap.hsk1FinishDate && (
          <div className="text-right">
            <div className="text-xs text-stone-500">Dự kiến học xong HSK 1</div>
            <div className="font-semibold">{roadmap.hsk1FinishDate.toLocaleDateString("vi-VN")}</div>
          </div>
        )}
      </div>

      <ol className="relative">
        {roadmap.stages.map((s, i) => (
          <StageRow key={s.id} stage={s} index={i + 1} last={i === roadmap.stages.length - 1} />
        ))}
      </ol>

      <div className="card text-sm text-stone-600 dark:text-stone-400">
        <div className="mb-1 font-semibold text-stone-800 dark:text-stone-200">Nhịp học mỗi ngày (30–45 phút)</div>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Ôn hết thẻ đến hạn trước.</li>
          <li>Luyện nghe pinyin 20 câu (tới khi nắm vững).</li>
          <li>Học 1 bài mới. Tồn trên 60 thẻ thì tạm dừng bài mới để ôn.</li>
        </ol>
      </div>
    </div>
  );
}

function StageRow({ stage, index, last }: { stage: RoadmapStage; index: number; last: boolean }) {
  const [open, setOpen] = useState(stage.status === "current");
  const expandable = !!(stage.items || stage.lessons);
  return (
    <li className="relative flex gap-3 pb-4">
      {!last && <span className="absolute top-9 bottom-0 left-[17px] w-0.5 bg-stone-200 dark:bg-stone-800" aria-hidden />}
      <span className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-semibold ${DOT[stage.status]}`}>
        {stage.status === "done" ? "✓" : stage.status === "locked" ? "🔒" : index}
      </span>
      <div className={`card min-w-0 flex-1 ${stage.status === "current" ? "border-brand-600" : ""} ${stage.status === "locked" ? "opacity-70" : ""}`}>
        <button className="w-full text-left" onClick={() => expandable && setOpen(!open)} disabled={!expandable}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[stage.status].cls}`}>{BADGE[stage.status].text}</span>
            <span className="text-xs text-stone-500">{stage.period}</span>
          </div>
          <div className="mt-1 flex items-start justify-between gap-2">
            <h2 className="font-semibold">{stage.title}</h2>
            {expandable && <span className="text-stone-400">{open ? "▴" : "▾"}</span>}
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">{stage.goal}</p>
          {stage.progress && stage.status !== "locked" && (
            <div className="mt-2">
              <div className="mb-1 text-right text-xs text-stone-500">{stage.progress.label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div
                  className={`h-full ${stage.status === "done" ? "bg-green-600" : "bg-brand-600"}`}
                  style={{ width: `${stage.progress.total ? (stage.progress.done / stage.progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </button>

        {open && stage.items && (
          <ul className="mt-3 space-y-1">
            {stage.items.map((it) => (
              <li key={it.label}>
                <Link to={it.to ?? "#"} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800">
                  <span className={it.done ? "text-green-600" : "text-stone-300 dark:text-stone-600"}>{it.done ? "●" : "○"}</span>
                  <span className={it.done ? "text-stone-500 line-through decoration-stone-300" : ""}>{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {open && stage.lessons && <LessonWeeks lessons={stage.lessons} />}
      </div>
    </li>
  );
}

function LessonWeeks({ lessons }: { lessons: RoadmapLesson[] }) {
  const weeks: RoadmapLesson[][] = [];
  for (let i = 0; i < lessons.length; i += 5) weeks.push(lessons.slice(i, i + 5));
  return (
    <div className="mt-3 space-y-3">
      {weeks.map((w, wi) => (
        <div key={wi}>
          <div className="mb-1 text-xs font-medium tracking-wide text-stone-500 uppercase">
            Chặng {wi + 1} · Bài {w[0].order}–{w[w.length - 1].order}
          </div>
          <ul className="space-y-1">
            {w.map((l) => (
              <li key={l.id}>
                <Link
                  to={`/lessons/${l.id}`}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800 ${
                    l.status === "next" ? "bg-brand-50 font-medium dark:bg-brand-800/20" : ""
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      l.status === "done" ? "bg-green-600 text-white" : l.status === "next" ? "bg-brand-700 text-white" : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  >
                    {l.status === "done" ? "✓" : l.order}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{l.title}</span>
                  <span className={`shrink-0 text-xs ${l.status === "done" ? "text-green-700 dark:text-green-400" : "text-stone-500"}`}>
                    {l.status === "done" ? `Xong ${fmt(l.date)}` : l.status === "next" ? `Tiếp theo · ${fmt(l.date)}` : fmt(l.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
