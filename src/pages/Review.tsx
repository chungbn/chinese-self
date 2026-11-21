import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { getWord } from "../data";
import { previewCard, reviewCard } from "../db/actions";
import { db, SKILL_LABEL, type CardRow } from "../db/db";
import { checkTyped, formatPinyin, type TypedResult } from "../lib/pinyin";
import { shuffle } from "../lib/shuffle";
import { speak } from "../lib/tts";
import { formatInterval, Rating, type Grade } from "../srs/scheduler";
import { WordDetail } from "../components/ui";

/** Thẻ đến hạn trong khoảng này sẽ được hỏi lại ngay trong phiên. */
const RELEARN_WINDOW_MS = 20 * 60 * 1000;
const SESSION_LIMIT = 200;

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: Rating.Again, label: "Quên", cls: "bg-red-600 hover:bg-red-700" },
  { g: Rating.Hard, label: "Khó", cls: "bg-amber-600 hover:bg-amber-700" },
  { g: Rating.Good, label: "Nhớ", cls: "bg-green-600 hover:bg-green-700" },
  { g: Rating.Easy, label: "Dễ", cls: "bg-sky-600 hover:bg-sky-700" },
];

export default function Review() {
  const [queue, setQueue] = useState<CardRow[] | null>(null);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    db.cards
      .where("dueAt")
      .belowOrEqual(new Date())
      .limit(SESSION_LIMIT)
      .toArray()
      .then((cards) => setQueue(shuffle(cards)));
  }, []);

  const onGraded = useCallback((updated: CardRow) => {
    setDoneCount((n) => n + 1);
    setQueue((q) => {
      if (!q) return q;
      const rest = q.slice(1);
      return updated.dueAt.getTime() - Date.now() <= RELEARN_WINDOW_MS ? [...rest, updated] : rest;
    });
  }, []);

  if (queue === null) return <p className="text-stone-500">Đang tải…</p>;

  if (queue.length === 0) {
    return (
      <div className="card space-y-3 py-10 text-center">
        <div className="text-5xl">{doneCount > 0 ? "✅" : "☕"}</div>
        <div className="text-xl font-semibold">{doneCount > 0 ? `Xong! Bạn đã ôn ${doneCount} lượt.` : "Không có thẻ nào đến hạn."}</div>
        <p className="text-stone-500">Quay lại sau, hoặc học thêm bài mới.</p>
        <div className="flex justify-center gap-2">
          <Link to="/lessons" className="btn-primary">
            Học bài mới
          </Link>
          <Link to="/" className="btn-ghost">
            Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>Đã ôn: {doneCount}</span>
        <span>Còn lại: {queue.length}</span>
      </div>
      <ReviewCard key={`${queue[0].id}-${doneCount}`} card={queue[0]} onGraded={onGraded} />
    </div>
  );
}

function ReviewCard({ card, onGraded }: { card: CardRow; onGraded: (c: CardRow) => void }) {
  const word = getWord(card.wordId);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<TypedResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [intervals, setIntervals] = useState<Record<Grade, Date> | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = card.skill !== "recognize";

  useEffect(() => {
    previewCard(card).then(setIntervals);
    if (card.skill === "listen") speak(word.hanzi);
    inputRef.current?.focus();
  }, [card, word.hanzi]);

  const grade = useCallback(
    async (g: Grade) => {
      if (busy) return;
      setBusy(true);
      const updated = await reviewCard(card, g);
      onGraded(updated);
    },
    [busy, card, onGraded],
  );

  const check = () => {
    const r = checkTyped(typed, word);
    setResult(r);
    setRevealed(true);
    if (card.skill !== "listen") speak(word.hanzi);
  };

  // Gợi ý mức điểm sau khi gõ
  const suggested: Grade | null = !isTyping ? null : result?.ok ? Rating.Good : Rating.Again;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = document.activeElement === inputRef.current;
      if (!revealed) {
        if (!isTyping && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      if (inInput) return;
      if (["1", "2", "3", "4"].includes(e.key)) grade(Number(e.key) as Grade);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        grade(suggested ?? Rating.Good);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, isTyping, grade, suggested]);

  return (
    <div className="space-y-4">
      <div className="card py-8 text-center">
        <div className="mb-3 text-xs font-medium tracking-wide text-stone-400 uppercase">{SKILL_LABEL[card.skill]}</div>

        {!revealed && card.skill === "recognize" && <div className="han text-7xl">{word.hanzi}</div>}

        {!revealed && card.skill === "recall" && (
          <>
            <div className="text-sm text-stone-500">Gõ chữ Hán hoặc pinyin của từ:</div>
            <div className="mt-1 text-2xl font-semibold">{word.vi}</div>
            <div className="text-sm text-stone-500">{word.pos}</div>
            {showHint ? (
              <div className="mt-2 text-sm">Hán Việt: {word.hv}</div>
            ) : (
              <button className="mt-2 text-sm text-brand-700 hover:underline" onClick={() => setShowHint(true)}>
                Gợi ý Hán Việt
              </button>
            )}
          </>
        )}

        {!revealed && card.skill === "listen" && (
          <>
            <div className="text-sm text-stone-500">Nghe và gõ chữ Hán hoặc pinyin:</div>
            <div className="mt-2 flex justify-center">
              <button className="btn-ghost text-lg" onClick={() => speak(word.hanzi)}>
                🔊 Nghe lại
              </button>
              <button className="btn-ghost ml-2 text-lg" onClick={() => speak(word.hanzi, 0.5)}>
                🐢 Chậm
              </button>
            </div>
          </>
        )}

        {revealed && <WordDetail word={word} />}
      </div>

      {isTyping && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!revealed) check();
          }}
          className="space-y-2"
        >
          <input
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={revealed}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="vd: 学生 · xue2sheng · xuésheng"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-xl outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900"
          />
          {!revealed && (
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                Kiểm tra (Enter)
              </button>
              <button type="button" className="btn-ghost" onClick={() => {
                  setResult({ ok: false, reason: "wrong" });
                  setRevealed(true);
                  speak(word.hanzi);
                }}>
                Không nhớ
              </button>
            </div>
          )}
          {result && <Feedback result={result} typed={typed} py={word.py} />}
        </form>
      )}

      {!revealed && !isTyping && (
        <button className="btn-primary w-full py-3" onClick={() => setRevealed(true)}>
          Hiện đáp án (Space)
        </button>
      )}

      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map(({ g, label, cls }, idx) => (
            <button
              key={g}
              disabled={busy}
              onClick={() => grade(g)}
              className={`btn flex-col gap-0 py-2 text-white ${cls} ${suggested === g ? "ring-4 ring-offset-2 ring-stone-400 dark:ring-offset-stone-950" : ""}`}
            >
              <span>{label}</span>
              <span className="text-xs opacity-80">
                {idx + 1} · {intervals ? formatInterval(new Date(), intervals[g]) : "…"}
              </span>
            </button>
          ))}
        </div>
      )}
      {revealed && <p className="text-center text-xs text-stone-400">Phím 1–4 để chấm, Enter = mức được gợi ý</p>}
    </div>
  );
}

function Feedback({ result, typed, py }: { result: TypedResult; typed: string; py: string }) {
  if (result.ok && result.toneChecked) return <div className="rounded-xl bg-green-100 p-3 text-green-800 dark:bg-green-950 dark:text-green-300">✓ Chính xác!</div>;
  if (result.ok)
    return (
      <div className="rounded-xl bg-green-100 p-3 text-green-800 dark:bg-green-950 dark:text-green-300">
        ✓ Đúng âm. Nhớ cả thanh điệu: <b>{formatPinyin(py)}</b> <span className="text-sm opacity-75">(gõ số thanh như xue2sheng để được chấm thanh)</span>
      </div>
    );
  if (result.reason === "tone")
    return (
      <div className="rounded-xl bg-amber-100 p-3 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
        Sai thanh điệu. Bạn gõ «{typed}», đúng là <b>{formatPinyin(py)}</b>
      </div>
    );
  return (
    <div className="rounded-xl bg-red-100 p-3 text-red-800 dark:bg-red-950 dark:text-red-300">
      ✗ Chưa đúng{typed ? ` («${typed}»)` : ""}. Đáp án: <b>{formatPinyin(py)}</b>
    </div>
  );
}
