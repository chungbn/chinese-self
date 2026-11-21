import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { getWord, LESSON_BY_ID } from "../data";
import { recordPinyinTab } from "../db/actions";
import { db } from "../db/db";
import { useDailyPlan } from "../hooks/useDailyPlan";
import { useNow } from "../hooks/useNow";
import { DRILL_GOAL, DRILL_MODE_LABEL, TOPIC_TAB, type DrillMode, type PinyinTopic, type PlanTask } from "../lib/plan";
import { dayKey } from "../lib/streak";
import { Drill, Pitfalls, Sandhi, Sounds, Tones } from "../components/pinyin";
import { AudioButton, Pinyin, ToneHanzi } from "../components/ui";
import { LessonFlow } from "./LessonLearn";
import { ReviewSession } from "./Review";

/**
 * Chế độ tập trung: mở từ một việc trong «Kế hoạch hôm nay», chỉ hiện đúng nội dung của việc đó.
 * Thông tin việc được «chốt» lúc mở, để kế hoạch thay đổi trong lúc học không làm đổi nội dung.
 */
export default function SessionPage() {
  const { taskId = "" } = useParams();
  // key theo taskId: chuyển sang việc khác thì dựng lại toàn bộ (chốt lại việc mới)
  return <Session key={taskId} taskId={taskId} />;
}

function Session({ taskId }: { taskId: string }) {
  const now = useNow();
  const plan = useDailyPlan(now);
  const [task, setTask] = useState<PlanTask | null | undefined>(undefined);

  // Chốt việc ngay lần đầu có kế hoạch (cập nhật state trong lúc render — mẫu «derived state» của React)
  if (plan && task === undefined) setTask(plan.tasks.find((t) => t.id === taskId) ?? null);

  if (task === undefined) return <div className="card h-64 animate-pulse" />;

  const required = plan?.tasks ?? [];
  const index = required.findIndex((t) => t.id === taskId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800" aria-label="Về kế hoạch hôm nay">
          ×
        </Link>
        <div className="min-w-0">
          <div className="text-xs text-stone-500">
            Kế hoạch hôm nay{index >= 0 ? ` · Việc ${index + 1}/${required.length}` : ""}
          </div>
          <h1 className="truncate font-semibold">{task ? task.title.replace(/ \(\d+\/\d+ câu\)$/, "") : "Không tìm thấy việc"}</h1>
        </div>
      </div>

      {!task && (
        <div className="card space-y-3 text-center">
          <p>Việc này không có trong kế hoạch hôm nay.</p>
          <Link to="/" className="btn-primary">
            Về kế hoạch hôm nay
          </Link>
        </div>
      )}
      {task?.session.kind === "pinyin-topic" && <TopicSession topic={task.session.topic} taskId={task.id} />}
      {task?.session.kind === "drill" && <DrillSession mode={task.session.mode} taskId={task.id} />}
      {task?.session.kind === "review" && <ReviewSession doneActions={<NextStep currentId={task.id} />} />}
      {task?.session.kind === "lesson" && <LessonSession task={task} lessonId={task.session.lessonId} />}
      {task?.session.kind === "reread" && <RereadSession lessonId={task.session.lessonId} taskId={task.id} />}
    </div>
  );
}

/** Nút đi tiếp: việc chưa xong kế tiếp trong kế hoạch, hoặc báo đã xong cả ngày. */
function NextStep({ currentId }: { currentId: string }) {
  const now = useNow();
  const plan = useDailyPlan(now);
  if (!plan) return null;
  const next = plan.tasks.find((t) => t.done === false && t.id !== currentId && t.tone !== "blocked");
  const optional = plan.tasks.find((t) => t.done === null && t.id !== currentId);
  return (
    <div className="space-y-2">
      {next ? (
        <Link to={next.to} replace className="btn-primary w-full py-3">
          Việc tiếp theo: {next.title} ›
        </Link>
      ) : (
        <p className="rounded-xl bg-green-100 p-3 text-center text-green-800 dark:bg-green-950 dark:text-green-300">Đã xong mọi việc trong kế hoạch hôm nay 🎉</p>
      )}
      {!next && optional && (
        <Link to={optional.to} replace className="btn-ghost w-full">
          {optional.title} (tuỳ chọn)
        </Link>
      )}
      <Link to="/" className="btn-ghost w-full">
        Về kế hoạch hôm nay
      </Link>
    </div>
  );
}

const TOPIC_INTRO: Record<PinyinTopic, string> = {
  tones: "Đọc mô tả từng thanh, rồi bấm nghe các bộ âm và đọc to theo. Chú ý độ cao bắt đầu của thanh 1 và thanh 4.",
  initials: "Bấm từng ô để nghe, đọc to theo. Hôm nay chỉ cần học phụ âm đầu.",
  "finals-1": "Bấm từng ô để nghe, đọc to theo. Hôm nay học vần đơn và vần ghép cơ bản.",
  "finals-2": "Bấm từng ô để nghe, đọc to theo. Hôm nay học các vần bắt đầu bằng i, u, ü.",
  pitfalls: "Đọc các lỗi hay gặp, rồi nghe kỹ từng cặp âm và đọc to để phân biệt.",
  sandhi: "Đọc từng quy tắc, bấm nghe ví dụ. Dấu thanh viết không đổi, chỉ cách đọc thay đổi.",
};

function TopicSession({ topic, taskId }: { topic: PinyinTopic; taskId: string }) {
  const [finished, setFinished] = useState(false);
  const finish = async () => {
    await recordPinyinTab(topic);
    // Các phần không bị chia nhỏ thì ghi luôn tab chung (dùng cho lộ trình và chế độ luyện nghe)
    if (!["initials", "finals-1", "finals-2"].includes(topic)) await recordPinyinTab(TOPIC_TAB[topic]);
    setFinished(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (finished)
    return (
      <div className="card space-y-3 py-6 text-center">
        <div className="text-4xl">✅</div>
        <div className="font-semibold">Đã học xong phần hôm nay</div>
        <NextStep currentId={taskId} />
      </div>
    );
  return (
    <>
      <p className="rounded-xl bg-stone-100 p-3 text-sm text-stone-600 dark:bg-stone-900 dark:text-stone-400">{TOPIC_INTRO[topic]}</p>
      {topic === "tones" && <Tones />}
      {(topic === "initials" || topic === "finals-1" || topic === "finals-2") && <Sounds show={topic} />}
      {topic === "pitfalls" && <Pitfalls />}
      {topic === "sandhi" && <Sandhi />}
      <button className="btn-primary w-full py-3" onClick={finish}>
        Đã học xong ✓
      </button>
    </>
  );
}

function DrillSession({ mode, taskId }: { mode: DrillMode; taskId: string }) {
  const today = dayKey(useNow());
  const count = (useLiveQuery(() => db.meta.get(`drill:${today}`), [today])?.value as number | undefined) ?? 0;
  const reached = count >= DRILL_GOAL;
  const [keepGoing, setKeepGoing] = useState(false);

  if (reached && !keepGoing)
    return (
      <div className="card space-y-3 py-6 text-center">
        <div className="text-4xl">🎧</div>
        <div className="font-semibold">Đủ {DRILL_GOAL} câu luyện nghe hôm nay!</div>
        <button className="btn-ghost w-full" onClick={() => setKeepGoing(true)}>
          Luyện thêm
        </button>
        <NextStep currentId={taskId} />
      </div>
    );

  return (
    <Drill
      mode={mode}
      header={
        <div>
          <div className="mb-1 flex justify-between text-xs text-stone-500">
            <span>Chế độ: {DRILL_MODE_LABEL[mode]}</span>
            <span>
              {Math.min(count, DRILL_GOAL)}/{DRILL_GOAL} câu{count > DRILL_GOAL ? ` (+${count - DRILL_GOAL})` : ""}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${Math.min(1, count / DRILL_GOAL) * 100}%` }} />
          </div>
        </div>
      }
    />
  );
}

function LessonSession({ task, lessonId }: { task: PlanTask; lessonId: string }) {
  const [restart, setRestart] = useState(false);
  const lesson = LESSON_BY_ID.get(lessonId);
  if (task.done === true && !restart)
    return (
      <div className="card space-y-3 py-6 text-center">
        <div className="text-4xl">📘</div>
        <div className="font-semibold">
          Bạn đã học Bài {lesson?.order}: {lesson?.title} hôm nay
        </div>
        <button className="btn-ghost w-full" onClick={() => setRestart(true)}>
          Học lại bài này
        </button>
        <NextStep currentId={task.id} />
      </div>
    );
  return <LessonFlow lessonId={lessonId} withGrammar doneActions={<NextStep currentId={task.id} />} />;
}

function RereadSession({ lessonId, taskId }: { lessonId: string; taskId: string }) {
  const lesson = LESSON_BY_ID.get(lessonId);
  const [finished, setFinished] = useState(false);
  if (!lesson) return null;
  if (finished)
    return (
      <div className="card space-y-3 py-6 text-center">
        <div className="text-4xl">✅</div>
        <div className="font-semibold">Đã đọc lại xong</div>
        <NextStep currentId={taskId} />
      </div>
    );
  return (
    <>
      <div className="card space-y-2">
        <h2 className="font-semibold">Ngữ pháp</h2>
        <ol className="list-decimal space-y-2 pl-5 text-stone-700 dark:text-stone-300">
          {lesson.grammar.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ol>
      </div>
      <p className="text-sm text-stone-500">Đọc to từng câu ví dụ, sau đó tự đặt một câu mới với từ đó.</p>
      <ul className="grid gap-2">
        {lesson.wordIds.map(getWord).map((w) => (
          <li key={w.id} className="card py-3">
            <div className="flex items-center gap-3">
              <ToneHanzi word={w} className="text-2xl" />
              <Pinyin py={w.py} className="font-medium" />
              <span className="min-w-0 flex-1 truncate text-sm text-stone-500">{w.vi}</span>
              <AudioButton text={w.hanzi} />
            </div>
            {w.ex && (
              <div className="mt-2 flex items-start gap-1 rounded-lg bg-stone-100 p-2 text-sm dark:bg-stone-800">
                <div className="min-w-0 flex-1">
                  <div className="han text-base">{w.ex[0]}</div>
                  <div className="text-stone-500">{w.ex[1]}</div>
                  <div>{w.ex[2]}</div>
                </div>
                <AudioButton text={w.ex[0]} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <button className="btn-primary w-full py-3" onClick={() => setFinished(true)}>
        Đọc xong ✓
      </button>
    </>
  );
}
