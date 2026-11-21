import { Link } from "react-router";
import type { Roadmap } from "../lib/roadmap";

const SHORT: Record<string, string> = { pinyin: "Phát âm", hsk1: "HSK 1", consolidate: "Củng cố", hsk2: "HSK 2", hsk3: "HSK 3+" };

/** Tóm tắt lộ trình trên trang chủ, bấm vào để xem chi tiết. */
export function RoadmapStrip({ roadmap }: { roadmap: Roadmap }) {
  return (
    <Link to="/roadmap" className="card block hover:border-brand-500" aria-label="Xem lộ trình học">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">Lộ trình của bạn</span>
        <span className="text-xs text-brand-700 dark:text-brand-500">Xem chi tiết ›</span>
      </div>
      <div className="flex items-start">
        {roadmap.stages.map((s, i) => (
          <div key={s.id} className="relative flex flex-1 flex-col items-center gap-1">
            {i > 0 && (
              <span
                className={`absolute top-3 right-1/2 h-0.5 w-full ${s.status === "done" || s.status === "current" ? "bg-brand-600" : "bg-stone-200 dark:bg-stone-800"}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-[1] flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                s.status === "done"
                  ? "bg-green-600 text-white"
                  : s.status === "current"
                    ? "bg-brand-700 text-white ring-4 ring-brand-500/25"
                    : "border-2 border-stone-300 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900"
              }`}
            >
              {s.status === "done" ? "✓" : i + 1}
            </span>
            <span className={`text-center text-[11px] leading-tight ${s.status === "current" ? "font-semibold text-brand-700 dark:text-brand-500" : "text-stone-500"}`}>
              {SHORT[s.id]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-1 text-xs text-stone-500">
        <span>{roadmap.currentLabel}</span>
        {roadmap.hsk1FinishDate && <span>Dự kiến xong HSK 1: {roadmap.hsk1FinishDate.toLocaleDateString("vi-VN")}</span>}
      </div>
    </Link>
  );
}
