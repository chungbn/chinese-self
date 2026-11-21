import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { getWord, LESSON_BY_ID } from "../data";
import { completeLesson } from "../db/actions";
import { db } from "../db/db";
import { AudioButton, PageTitle, Pinyin, ToneHanzi } from "../components/ui";

export default function LessonDetail() {
  const { id = "" } = useParams();
  const lesson = LESSON_BY_ID.get(id);
  const done = useLiveQuery(() => db.lessons.get(id), [id]);
  const [msg, setMsg] = useState("");

  if (!lesson) return <p>Không tìm thấy bài học.</p>;
  const words = lesson.wordIds.map(getWord);

  return (
    <div className="space-y-4">
      <Link to="/lessons" className="text-sm text-stone-500 hover:underline">
        ‹ Danh sách bài
      </Link>
      <PageTitle sub={`HSK ${lesson.level} · ${words.length} từ${done ? " · đã hoàn thành" : ""}`}>
        Bài {lesson.order}: {lesson.title}
      </PageTitle>

      <div className="flex flex-wrap gap-2">
        <Link to={`/lessons/${id}/learn`} className="btn-primary">
          {done ? "Học lại bài này" : "Bắt đầu học"}
        </Link>
        {!done && (
          <button
            className="btn-ghost"
            onClick={async () => {
              const n = await completeLesson(id);
              setMsg(`Đã thêm ${n} thẻ vào lịch ôn.`);
            }}
          >
            Đã biết, thêm thẳng vào ôn tập
          </button>
        )}
      </div>
      {msg && <p className="text-green-700 dark:text-green-400">{msg}</p>}

      <section className="card">
        <h2 className="mb-2 font-semibold">Ngữ pháp trong bài</h2>
        <ul className="list-disc space-y-2 pl-5 text-stone-700 dark:text-stone-300">
          {lesson.grammar.map((g, i) => (
            <li key={i}>
              {g}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Từ vựng</h2>
        <ul className="grid gap-2">
          {words.map((w) => (
            <li key={w.id} className="card flex items-center gap-3 py-3">
              <ToneHanzi word={w} className="w-20 shrink-0 text-3xl" />
              <div className="min-w-0 flex-1">
                <div>
                  <Pinyin py={w.py} className="font-medium" />
                  <span className="ml-2 text-sm text-stone-500">{w.hv}</span>
                </div>
                <div className="text-sm">{w.vi}</div>
              </div>
              <AudioButton text={w.hanzi} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
