/** Phát âm tiếng Trung bằng Web Speech API của trình duyệt (miễn phí, chạy offline nếu máy có sẵn giọng). */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined && cachedVoice !== null) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const zh =
    voices.find((v) => v.lang === "zh-CN" && /tingting|xiaoxiao|google/i.test(v.name)) ??
    voices.find((v) => v.lang === "zh-CN") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("zh")) ??
    null;
  cachedVoice = zh;
  return zh;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = undefined;
  });
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function hasChineseVoice(): boolean {
  return ttsSupported() && pickVoice() !== null;
}

export function speak(text: string, rate = 0.8): void {
  if (!ttsSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.rate = rate;
  synth.speak(u);
}

/** Theo dõi việc trình duyệt đã nạp giọng tiếng Trung chưa (danh sách giọng được nạp bất đồng bộ). */
export function onVoicesChanged(cb: () => void): () => void {
  if (!ttsSupported()) return () => {};
  const handler = () => {
    cachedVoice = undefined;
    cb();
  };
  window.speechSynthesis.addEventListener("voiceschanged", handler);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
}
