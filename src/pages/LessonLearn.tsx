import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { getWord, LESSON_BY_ID, WORDS, type Word } from "../data";
import { completeLesson } from "../db/actions";
import { speak } from "../lib/tts";
import { sampleOthers, shuffle } from "../lib/shuffle";
import { WordDetail } from "../components/ui";

type QuizItem = { word: Word; mode: "meaning" | "hanzi"; options: Word[] };

function buildQuiz(words: Word[]): QuizItem[] {
  // Mỗi từ 2 câu: chữ Hán → nghĩa, và nghĩa → chữ Hán. Phương án nhiễu lấy trong bài, thiếu thì lấy cùng cấp.
  const items: QuizItem[] = [];
  for (const w of words) {
    for (const mode of ["meaning", "hanzi"] as const) {
      const pool = words.length >= 4 ? words : WORDS.filter((x) => x.level === w.level);
      items.push({ word: w, mode, options: shuffle([w, ...sampleOthers(pool, w, 3)]) });
    }
  }
  return shuffle(items);
}

export default function LessonLearn() {
  const { id = "" } = useParams();
  const lesson = LESSON_BY_ID.get(id);
  const words = useMemo(() => (lesson ? lesson.wordIds.map(getWord) : []), [lesson]);
  const [stage, setStage] = useState<"learn" | "quiz" | "done">("learn");
  const [i, setI] = useState(0);

  if (!lesson) return <p>Không tìm thấy bài học.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <Link to={`/lessons/${id}`} className="hover:underline">
          ‹ Bài {lesson.order}: {lesson.title}
        </Link>
        <span>{stage === "learn" ? `Từ ${i + 1}/${words.length}` : stage === "quiz" ? "Luyện tập" : "Hoàn thành"}</span>
      </div>
      {stage === "learn" && (
        <LearnCards
          words={words}
          i={i}
          setI={setI}
          onFinish={() => setStage("quiz")}
        />
      )}
      {stage === "quiz" && <Quiz words={words} onFinish={() => setStage("done")} />}
      {stage === "done" && <Done lessonId={id} />}
    </div>
  );
}

function LearnCards({ words, i, setI, onFinish }: { words: Word[]; i: number; setI: (n: number) => void; onFinish: () => void }) {
  const w = words[i];
  useEffect(() => {
    speak(w.hanzi);
  }, [w]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (i < words.length - 1) setI(i + 1);
        else onFinish();
      }
      if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, words.length, setI, onFinish]);

  return (
    <>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${((i + 1) / words.length) * 100}%` }} />
      </div>
      <div className="card py-8">
        <WordDetail word={w} />
      </div>
      <div className="flex justify-between gap-2">
        <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
          ‹ Trước
        </button>
        {i < words.length - 1 ? (
          <button className="btn-primary" onClick={() => setI(i + 1)}>
            Tiếp ›
          </button>
        ) : (
          <button className="btn-primary" onClick={onFinish}>
            Luyện tập ›
          </button>
        )}
      </div>
      <p className="text-center text-xs text-stone-400">Phím ← → hoặc Enter để chuyển từ</p>
    </>
  );
}

function Quiz({ words, onFinish }: { words: Word[]; onFinish: () => void }) {
  const [queue, setQueue] = useState(() => buildQuiz(words));
  const [picked, setPicked] = useState<Word | null>(null);
  const [total] = useState(queue.length);
  const [correct, setCorrect] = useState(0);
  const item = queue[0];

  const next = () => {
    const wasRight = picked?.id === item.word.id;
    const rest = queue.slice(1);
    // Trả lời sai: hỏi lại câu đó ở cuối hàng
    const newQueue = wasRight ? rest : [...rest, { ...item, options: shuffle(item.options) }];
    setPicked(null);
    if (newQueue.length === 0) onFinish();
    else setQueue(newQueue);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!item) return;
      if (!picked && ["1", "2", "3", "4"].includes(e.key)) {
        const opt = item.options[Number(e.key) - 1];
        if (opt) choose(opt);
      } else if (picked && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!item) return null;

  function choose(opt: Word) {
    setPicked(opt);
    speak(item.word.hanzi);
    if (opt.id === item.word.id) setCorrect((c) => c + 1);
  }

  return (
    <>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div className="h-full bg-green-600 transition-all" style={{ width: `${(correct / total) * 100}%` }} />
      </div>
      <div className="card py-8 text-center">
        {item.mode === "meaning" ? (
          <>
            <div className="mb-1 text-sm text-stone-500">Chữ này nghĩa là gì?</div>
            <div className="han text-6xl">{item.word.hanzi}</div>
          </>
        ) : (
          <>
            <div className="mb-1 text-sm text-stone-500">Chữ Hán nào có nghĩa là</div>
            <div className="text-2xl font-semibold">{item.word.vi}</div>
          </>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {item.options.map((o, idx) => {
          const state = !picked ? "" : o.id === item.word.id ? "border-green-600 bg-green-50 dark:bg-green-950" : o.id === picked.id ? "border-red-600 bg-red-50 dark:bg-red-950" : "opacity-60";
          return (
            <button key={o.id} disabled={!!picked} onClick={() => choose(o)} className={`card text-left ${state}`}>
              <span className="mr-2 text-xs text-stone-400">{idx + 1}</span>
              {item.mode === "meaning" ? o.vi : <span className="han text-3xl">{o.hanzi}</span>}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="card">
          <WordDetail word={item.word} big={false} />
          <button className="btn-primary mt-4 w-full" onClick={next} autoFocus>
            Tiếp tục (Enter)
          </button>
        </div>
      )}
    </>
  );
}

function Done({ lessonId }: { lessonId: string }) {
  const [added, setAdded] = useState<number | null>(null);
  useEffect(() => {
    completeLesson(lessonId).then(setAdded);
  }, [lessonId]);
  return (
    <div className="card space-y-3 py-8 text-center">
      <div className="text-5xl">🎉</div>
      <div className="text-xl font-semibold">Hoàn thành bài học!</div>
      <p className="text-stone-500">
        {added === null ? "Đang lưu…" : added > 0 ? `Đã thêm ${added} thẻ vào lịch ôn tập.` : "Các từ trong bài đã có trong lịch ôn."}
      </p>
      <div className="flex justify-center gap-2">
        <Link to="/review" className="btn-primary">
          Ôn tập ngay
        </Link>
        <Link to="/lessons" className="btn-ghost">
          Về danh sách bài
        </Link>
      </div>
    </div>
  );
}
