import { useMemo, useState } from "react";
import { Link } from "react-router";
import { LESSON_BY_ID, WORDS, type Word } from "../data";
import { formatPinyin, stripVietnamese, toNumbered, toToneless } from "../lib/pinyin";
import { AudioButton, PageTitle, WordDetail } from "../components/ui";

const INDEX = WORDS.map((w) => ({
  w,
  plain: toToneless(w.py),
  num: toNumbered(w.py),
  hv: stripVietnamese(w.hv),
  vi: stripVietnamese(w.vi),
}));

export default function Dictionary() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Word | null>(null);

  const results = useMemo(() => {
    const raw = q.trim();
    if (!raw) return WORDS;
    const s = stripVietnamese(raw).replace(/\s+/g, " ");
    const compact = s.replace(/[\s']/g, "").replace(/ü/g, "v");
    return INDEX.filter(
      (e) =>
        e.w.hanzi.includes(raw) ||
        e.plain.startsWith(compact) ||
        e.num.startsWith(compact) ||
        e.hv.includes(s) ||
        e.vi.includes(s),
    ).map((e) => e.w);
  }, [q]);

  return (
    <div className="space-y-4">
      <PageTitle sub="Tìm theo chữ Hán, pinyin, âm Hán Việt hoặc nghĩa tiếng Việt.">Tra từ</PageTitle>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="vd: 学 · xuesheng · hoc sinh · bạn"
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900"
        autoFocus
      />
      <div className="text-sm text-stone-500">{results.length} kết quả</div>
      {open && (
        <div className="card relative">
          <button className="absolute top-2 right-3 text-xl text-stone-400" onClick={() => setOpen(null)} aria-label="Đóng">
            ×
          </button>
          <WordDetail word={open} />
          <div className="mt-3 text-center text-sm">
            <Link className="text-brand-700 hover:underline" to={`/lessons/${open.lessonId}`}>
              HSK {open.level} · Bài {LESSON_BY_ID.get(open.lessonId)?.order}: {LESSON_BY_ID.get(open.lessonId)?.title}
            </Link>
          </div>
        </div>
      )}
      <ul className="grid gap-1">
        {results.map((w) => (
          <li key={w.id}>
            <button onClick={() => setOpen(w)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-900">
              <span className="han w-16 shrink-0 text-2xl">{w.hanzi}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm">
                  <b>{formatPinyin(w.py)}</b> <span className="text-stone-500">· {w.hv}</span>
                </span>
                <span className="block truncate text-sm text-stone-600 dark:text-stone-400">{w.vi}</span>
              </span>
              <AudioButton text={w.hanzi} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

