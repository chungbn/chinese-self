import { useEffect, useState } from "react";
import { hasChineseVoice, onVoicesChanged } from "../lib/tts";

/** true/false khi đã biết, null khi danh sách giọng chưa nạp xong. */
export function useChineseVoice(): boolean | null {
  const [has, setHas] = useState<boolean | null>(() => (hasChineseVoice() ? true : null));
  useEffect(() => {
    const update = () => setHas(hasChineseVoice());
    const off = onVoicesChanged(update);
    // Một số trình duyệt không bắn sự kiện nếu giọng đã có sẵn
    const t = setTimeout(update, 1500);
    return () => {
      off();
      clearTimeout(t);
    };
  }, []);
  return has;
}
