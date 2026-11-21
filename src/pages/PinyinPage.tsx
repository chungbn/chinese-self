import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CONFUSABLE_PAIRS, FINALS, INITIALS, SANDHI_RULES, TONE_SETS, TONES, VIETNAMESE_PITFALLS, type SoundItem } from "../data/pinyin";
import { db } from "../db/db";
import { DRILL_MODE_LABEL, drillModeFor, type DrillMode } from "../lib/plan";
import { incrementDrill, recordPinyinTab } from "../db/actions";
import { toneOf } from "../lib/pinyin";
import { shuffle } from "../lib/shuffle";
import { speak } from "../lib/tts";
import { useChineseVoice } from "../hooks/useChineseVoice";
import { PageTitle } from "../components/ui";

const TABS = [
  { id: "tones", label: "4 thanh" },
  { id: "sounds", label: "Thanh mẫu · Vận mẫu" },
  { id: "sandhi", label: "Biến điệu" },
  { id: "pitfalls", label: "Lỗi hay gặp" },
  { id: "drill", label: "Luyện nghe" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function PinyinPage() {
  const [params, setParams] = useSearchParams();
  const tab: TabId = TABS.some((t) => t.id === params.get("tab")) ? (params.get("tab") as TabId) : "tones";
  const setTab = (t: TabId) => setParams({ tab: t }, { replace: true });
  const topicsSeen =
    useLiveQuery(async () => [
      ...new Set((await db.meta.where("key").startsWith("pinyinTabs:").toArray()).flatMap((r) => (r.value as string[]) ?? [])),
    ]) ?? [];
  const modeParam = params.get("mode");
  const drillMode: DrillMode =
    modeParam === "tones" || modeParam === "pairs" || modeParam === "mix" ? modeParam : drillModeFor(null, topicsSeen);
  const setDrillMode = (m: DrillMode) => setParams({ tab: "drill", mode: m }, { replace: true });
  useEffect(() => {
    recordPinyinTab(tab);
  }, [tab]);
  const done = (useLiveQuery(() => db.meta.get("pinyinDone")) ?? null)?.value === true;
  const voice = useChineseVoice();

  return (
    <div className="space-y-4">
      <PageTitle sub="Nền móng của tiếng Trung. Phát âm sai từ đầu sẽ rất khó sửa về sau.">Pinyin & thanh điệu</PageTitle>
      {voice === false && (
        <div className="rounded-xl bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-300">
          Máy chưa có giọng đọc tiếng Trung, có thể sẽ không nghe được. Trên macOS/iOS: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → thêm «Tiếng Trung (Trung Quốc đại lục)».
        </div>
      )}
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${tab === t.id ? "bg-brand-700 text-white" : "bg-stone-200 dark:bg-stone-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tones" && <Tones />}
      {tab === "sounds" && <Sounds />}
      {tab === "sandhi" && <Sandhi />}
      {tab === "pitfalls" && <Pitfalls />}
      {tab === "drill" && <Drill key={drillMode} mode={drillMode} onModeChange={setDrillMode} />}

      <label className="card flex items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-brand-700"
          checked={done}
          onChange={(e) => db.meta.put({ key: "pinyinDone", value: e.target.checked })}
        />
        <span>Tôi đã nắm vững pinyin và thanh điệu</span>
      </label>
    </div>
  );
}

function ToneContour({ contour }: { contour: string }) {
  if (!contour) return <svg viewBox="0 0 40 40" className="h-10 w-10"><circle cx="20" cy="26" r="3" className="fill-stone-400" /></svg>;
  // Thang 5 bậc của Triệu Nguyên Nhậm: 5 = cao nhất
  const pts = [...contour].map((c, i, a) => `${4 + (i * 32) / (a.length - 1)},${36 - (Number(c) - 1) * 8}`).join(" ");
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10">
      <rect x="1" y="1" width="38" height="38" rx="4" className="fill-none stroke-stone-300 dark:stroke-stone-700" />
      <polyline points={pts} className="fill-none stroke-brand-600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tones() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {TONES.map((t) => (
          <div key={t.n} className="card flex items-start gap-3">
            <ToneContour contour={t.contour} />
            <div className="flex-1">
              <div className="font-semibold">
                <span className={`tone-${t.n} mr-2 text-xl`}>{t.mark}</span>
                {t.name}
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="mb-2 font-semibold">Nghe 4 thanh của cùng một âm</div>
        <p className="mb-3 text-sm text-stone-500">Bấm từng chữ để nghe, hoặc bấm tên âm để nghe cả 4 thanh liên tiếp.</p>
        <div className="grid gap-2">
          {TONE_SETS.map((s) => (
            <div key={s.syllable} className="flex items-center gap-2">
              <button className="w-14 text-left font-mono text-sm text-stone-500 hover:text-brand-700" onClick={() => speak(s.chars.join("，"), 0.6)}>
                {s.syllable} ▶
              </button>
              {s.chars.map((c, i) => (
                <button
                  key={c}
                  onClick={() => speak(c)}
                  className="flex flex-1 flex-col items-center rounded-lg border border-stone-200 py-1 hover:bg-stone-100 dark:border-stone-800 dark:hover:bg-stone-800"
                >
                  <span className="han text-xl">{c}</span>
                  <span className={`tone-${i + 1} text-sm`}>{s.py[i]}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoundGrid({ items }: { items: SoundItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((s) => (
        <button key={s.label} onClick={() => speak(s.char)} className="card flex items-start gap-2 p-3 text-left hover:border-brand-500">
          <span className="w-10 font-mono text-xl font-bold text-brand-700 dark:text-brand-500">{s.label}</span>
          <span className="flex-1">
            <span className="han text-lg">{s.char}</span> <span className={`tone-${toneOf(s.py)} text-sm`}>{s.py}</span>
            {s.note && <span className="block text-xs text-stone-500">{s.note}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function Sounds() {
  return (
    <div className="space-y-4">
      <section>
        <h2 className="mb-2 font-semibold">Thanh mẫu (phụ âm đầu) — {INITIALS.length}</h2>
        <SoundGrid items={INITIALS} />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Vận mẫu (vần) — {FINALS.length}</h2>
        <SoundGrid items={FINALS} />
      </section>
      <section className="card text-sm text-stone-600 dark:text-stone-400">
        <b>Quy tắc đánh dấu thanh:</b> đặt dấu trên a, nếu không có a thì trên o hoặc e; với cặp iu / ui thì đặt trên chữ đứng sau (jiǔ, duì).
      </section>
    </div>
  );
}

function Sandhi() {
  return (
    <div className="grid gap-3">
      {SANDHI_RULES.map((r) => (
        <div key={r.title} className="card">
          <div className="font-semibold">{r.title}</div>
          <p className="mb-2 text-sm text-stone-600 dark:text-stone-400">{r.body}</p>
          <div className="flex flex-wrap gap-2">
            {r.examples.map((e) => (
              <button key={e.zh} onClick={() => speak(e.zh)} className="rounded-lg border border-stone-200 px-3 py-1 text-left hover:bg-stone-100 dark:border-stone-800 dark:hover:bg-stone-800">
                <span className="han text-lg">{e.zh}</span> <span className="text-sm">{e.py}</span>
                <span className="block text-xs text-stone-500">{e.vi}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Pitfalls() {
  return (
    <div className="space-y-4">
      <ul className="card list-disc space-y-2 pl-8 text-stone-700 dark:text-stone-300">
        {VIETNAMESE_PITFALLS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="card">
        <div className="mb-2 font-semibold">Các cặp âm dễ nhầm</div>
        <div className="grid gap-2">
          {CONFUSABLE_PAIRS.map((p) => (
            <div key={p.a.label + p.b.label} className="flex flex-wrap items-center gap-2">
              {[p.a, p.b].map((s) => (
                <button key={s.label} onClick={() => speak(s.char)} className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-100 dark:border-stone-800 dark:hover:bg-stone-800">
                  <b className="font-mono">{s.label}</b> <span className="han">{s.char}</span> <span className={`tone-${toneOf(s.py)} text-sm`}>{s.py}</span>
                </button>
              ))}
              <span className="text-sm text-stone-500">{p.hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type DrillQ =
  | { kind: "tone"; char: string; py: string; answer: number }
  | { kind: "pair"; target: SoundItem; options: SoundItem[]; hint: string };

function makeQuestion(mode: DrillMode): DrillQ {
  const tone = mode === "tones" || (mode === "mix" && Math.random() < 0.6);
  if (tone) {
    const s = TONE_SETS[Math.floor(Math.random() * TONE_SETS.length)];
    const t = Math.floor(Math.random() * 4);
    return { kind: "tone", char: s.chars[t], py: s.py[t], answer: t + 1 };
  }
  const p = CONFUSABLE_PAIRS[Math.floor(Math.random() * CONFUSABLE_PAIRS.length)];
  const options = shuffle([p.a, p.b]);
  return { kind: "pair", target: options[Math.floor(Math.random() * 2)], options, hint: p.hint };
}

const DRILL_MODE_HINT: Record<DrillMode, string> = {
  tones: "Nghe một chữ, chọn thanh 1–4. Phù hợp khi mới học xong phần 4 thanh.",
  pairs: "Nghe và chọn đúng âm trong các cặp dễ nhầm. Nên học phần «Lỗi hay gặp» trước.",
  mix: "Trộn cả thanh điệu và âm dễ nhầm.",
};

function Drill({ mode, onModeChange }: { mode: DrillMode; onModeChange: (m: DrillMode) => void }) {
  const [q, setQ] = useState<DrillQ>(() => makeQuestion(mode));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const play = (qq = q) => speak(qq.kind === "tone" ? qq.char : qq.target.char);
  const answerKey = q.kind === "tone" ? String(q.answer) : q.target.label;

  const choose = (key: string) => {
    if (picked) return;
    setPicked(key);
    incrementDrill();
    setScore((s) => ({ right: s.right + (key === answerKey ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    const nq = makeQuestion(mode);
    setQ(nq);
    setPicked(null);
    play(nq);
  };

  return (
    <div className="card space-y-4 text-center">
      <div className="flex justify-center gap-1" role="radiogroup" aria-label="Chế độ luyện nghe">
        {(Object.keys(DRILL_MODE_LABEL) as DrillMode[]).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={m === mode}
            onClick={() => onModeChange(m)}
            className={`rounded-full px-3 py-1 text-sm ${m === mode ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}
          >
            {DRILL_MODE_LABEL[m]}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">{DRILL_MODE_HINT[mode]}</p>
      <div className="text-sm text-stone-500">
        Đúng {score.right}/{score.total}
      </div>
      <div className="text-stone-600 dark:text-stone-400">{q.kind === "tone" ? "Nghe và chọn thanh điệu" : "Nghe và chọn âm đúng"}</div>
      <button className="btn-primary text-lg" onClick={() => play()}>
        🔊 Nghe
      </button>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {q.kind === "tone"
          ? [1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => choose(String(n))} className={`card ${picked ? (String(n) === answerKey ? "border-green-600 bg-green-50 dark:bg-green-950" : picked === String(n) ? "border-red-600 bg-red-50 dark:bg-red-950" : "") : "hover:border-brand-500"}`}>
                <span className={`tone-${n} text-xl font-bold`}>{TONES[n - 1].mark}</span>
                <span className="block text-sm">Thanh {n}</span>
              </button>
            ))
          : q.options.map((o) => (
              <button key={o.label} onClick={() => choose(o.label)} className={`card col-span-1 sm:col-span-2 ${picked ? (o.label === answerKey ? "border-green-600 bg-green-50 dark:bg-green-950" : picked === o.label ? "border-red-600 bg-red-50 dark:bg-red-950" : "") : "hover:border-brand-500"}`}>
                <span className="font-mono text-xl font-bold">{o.label}</span>
              </button>
            ))}
      </div>
      {picked && (
        <div className="space-y-2">
          <div className={picked === answerKey ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
            {picked === answerKey ? "✓ Đúng!" : "✗ Chưa đúng."}{" "}
            {q.kind === "tone" ? (
              <>
                Đó là <span className="han">{q.char}</span> <span className={`tone-${q.answer}`}>{q.py}</span>
              </>
            ) : (
              <>
                Đó là <span className="han">{q.target.char}</span> {q.target.py} — {q.hint}
              </>
            )}
          </div>
          <button className="btn-ghost" onClick={next} autoFocus>
            Câu tiếp ›
          </button>
        </div>
      )}
    </div>
  );
}
