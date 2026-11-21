import { useEffect } from "react";
import { recordDayProgress } from "../db/actions";
import { useDailyPlan } from "../hooks/useDailyPlan";
import { useNow } from "../hooks/useNow";
import { planStatus } from "../lib/plan";
import { dayKey } from "../lib/streak";

/** Chạy nền ở mọi trang: lưu tiến độ kế hoạch hôm nay để tính chuỗi ngày hoàn thành. */
export function PlanTracker() {
  const now = useNow(30_000);
  const plan = useDailyPlan(now);
  const key = dayKey(now);
  const status = plan ? planStatus(plan) : null;
  useEffect(() => {
    if (status) recordDayProgress(key, status.done, status.total);
  }, [key, status?.done, status?.total]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
