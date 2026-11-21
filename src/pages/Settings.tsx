import { useLiveQuery } from "dexie-react-hooks";
import { useRef, useState } from "react";
import { dayKey, exportBackup, importBackup, resetAll } from "../db/actions";
import { db } from "../db/db";
import { speak } from "../lib/tts";
import { useChineseVoice } from "../hooks/useChineseVoice";
import { PageTitle } from "../components/ui";

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const voice = useChineseVoice();
  const counts = useLiveQuery(async () => ({
    cards: await db.cards.count(),
    reviews: await db.reviews.count(),
    lessons: await db.lessons.count(),
  }));

  const download = async () => {
    const json = await exportBackup();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chinese-self-${dayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    await db.meta.put({ key: "lastBackup", value: new Date().toISOString() });
    setMsg("Đã tải file sao lưu.");
  };

  const lastBackup = useLiveQuery(() => db.meta.get("lastBackup"))?.value as string | undefined;

  return (
    <div className="space-y-4">
      <PageTitle sub="Toàn bộ dữ liệu chỉ lưu trên trình duyệt của máy này.">Cài đặt</PageTitle>

      <section className="card space-y-3">
        <h2 className="font-semibold">Sao lưu tiến độ</h2>
        <p className="text-sm text-stone-500">
          {counts ? `${counts.lessons} bài đã học · ${counts.cards} thẻ · ${counts.reviews} lượt ôn.` : "…"}{" "}
          {lastBackup ? `Sao lưu gần nhất: ${new Date(lastBackup).toLocaleString("vi-VN")}.` : "Chưa sao lưu lần nào."}
        </p>
        <p className="text-sm text-stone-500">
          Nên sao lưu định kỳ: xoá dữ liệu trình duyệt sẽ mất tiến độ. Dùng file này để chuyển sang máy khác.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={download}>
            Tải file sao lưu
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            Khôi phục từ file…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              if (!confirm("Khôi phục sẽ GHI ĐÈ toàn bộ tiến độ hiện tại. Tiếp tục?")) return;
              try {
                await importBackup(await f.text());
                setMsg("Đã khôi phục tiến độ.");
              } catch (err) {
                setMsg(`Lỗi: ${(err as Error).message}`);
              }
            }}
          />
        </div>
        {msg && <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Phát âm</h2>
        <p className="text-sm text-stone-500">
          {voice === null
            ? "Đang kiểm tra giọng đọc…"
            : voice
            ? "Đã tìm thấy giọng đọc tiếng Trung trên máy."
            : "Chưa thấy giọng đọc tiếng Trung. Trên macOS/iOS: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → thêm Tiếng Trung (Trung Quốc đại lục). Trên Android: cài giọng tiếng Trung cho Google Text-to-Speech."}
        </p>
        <button className="btn-ghost" onClick={() => speak("你好，欢迎学习汉语！")}>
          🔊 Thử giọng đọc
        </button>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Cách gõ khi ôn tập</h2>
        <ul className="list-disc pl-5 text-sm text-stone-600 dark:text-stone-400">
          <li>Chữ Hán qua bộ gõ tiếng Trung của máy: 学生</li>
          <li>Pinyin kèm số thanh (thanh nhẹ để trống hoặc gõ 5): xue2sheng, nv3er2 (ü gõ là v)</li>
          <li>Pinyin có dấu: xuésheng</li>
          <li>Pinyin không dấu: xuesheng. Vẫn tính là đúng nhưng không chấm thanh điệu.</li>
        </ul>
      </section>

      <section className="card space-y-2 border-red-300 dark:border-red-900">
        <h2 className="font-semibold text-red-700 dark:text-red-400">Xoá toàn bộ tiến độ</h2>
        <button
          className="btn border border-red-600 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          onClick={async () => {
            if (!confirm("Xoá toàn bộ bài đã học, thẻ và lịch sử ôn? Không thể hoàn tác.")) return;
            await resetAll();
            setMsg("Đã xoá toàn bộ tiến độ.");
          }}
        >
          Xoá tiến độ
        </button>
      </section>
    </div>
  );
}
