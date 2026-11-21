import type { ReactNode } from "react";
import { syllables, toneOf } from "../lib/pinyin";
import { speak } from "../lib/tts";
import type { Word } from "../data";

export function AudioButton({ text, label, className = "" }: { text: string; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={`inline-flex items-center gap-1 rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-brand-700 dark:hover:bg-stone-800 ${className}`}
      aria-label={`Nghe: ${text}`}
      title="Nghe phát âm"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 5a10 10 0 0 1 0 14" />
      </svg>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}

/** Pinyin tô màu theo thanh điệu. */
export function Pinyin({ py, className = "" }: { py: string; className?: string }) {
  // Tô màu từng âm tiết nhưng vẫn hiển thị theo dạng formatPinyin
  const words = py.split(" ");
  return (
    <span className={className}>
      {words.map((w, wi) => (
        <span key={wi}>
          {wi > 0 && " "}
          {w.split(".").map((s, si) => (
            <span key={si} className={`tone-${toneOf(s)}`}>
              {si > 0 && /^[aeoāáǎàēéěèōóǒò]/i.test(s) ? "'" : ""}
              {s}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/** Chữ Hán tô màu theo thanh điệu của từng chữ. */
export function ToneHanzi({ word, className = "" }: { word: Word; className?: string }) {
  const syl = syllables(word.py);
  const chars = [...word.hanzi];
  let si = 0;
  return (
    <span className={`han ${className}`}>
      {chars.map((c, i) => {
        // 儿 trong 儿化 không có âm tiết riêng
        const isEr = c === "儿" && i > 0 && syl.length < chars.length;
        const tone = isEr ? toneOf(syl[si - 1] ?? "") : toneOf(syl[si++] ?? "");
        return (
          <span key={i} className={`tone-${tone}`}>
            {c}
          </span>
        );
      })}
    </span>
  );
}

export function WordDetail({ word, big = true }: { word: Word; big?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-2">
        <ToneHanzi word={word} className={big ? "text-6xl sm:text-7xl" : "text-4xl"} />
        <AudioButton text={word.hanzi} />
      </div>
      <Pinyin py={word.py} className="text-2xl font-medium" />
      <div className="text-sm uppercase tracking-wide text-stone-500">
        Hán Việt: <span className="font-semibold normal-case text-stone-700 dark:text-stone-300">{word.hv}</span>
        <span className="mx-2">·</span>
        {word.pos}
      </div>
      <div className="text-xl">{word.vi}</div>
      {word.ex && (
        <div className="mt-3 w-full rounded-xl bg-stone-100 p-3 text-left dark:bg-stone-800">
          <div className="flex items-center gap-1">
            <span className="han text-lg">{word.ex[0]}</span>
            <AudioButton text={word.ex[0]} />
          </div>
          <div className="text-sm text-stone-500">{word.ex[1]}</div>
          <div className="text-sm">{word.ex[2]}</div>
        </div>
      )}
    </div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold">{children}</h1>
      {sub && <p className="mt-1 text-stone-500">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card flex flex-col">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

