import { useLiveQuery } from "dexie-react-hooks";
import { useSearchParams } from "react-router";
import { db } from "../db/db";
import { drillModeFor, type DrillMode } from "../lib/plan";
import { useChineseVoice } from "../hooks/useChineseVoice";
import { Drill, Pitfalls, Sandhi, Sounds, Tones } from "../components/pinyin";
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
  const done = (useLiveQuery(() => db.meta.get("pinyinDone")) ?? null)?.value === true;
  const voice = useChineseVoice();

  return (
    <div className="space-y-4">
      <PageTitle sub="Tra cứu và đọc lại toàn bộ phần phát âm. Bài học theo ngày nằm trong «Kế hoạch hôm nay» ở trang chủ.">Pinyin & thanh điệu</PageTitle>
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

