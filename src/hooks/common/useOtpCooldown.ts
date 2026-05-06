import { useEffect, useMemo, useState } from "react";
import { useOtpCooldownStore } from "@/store/useOtpCooldownStore";

type UseOtpCooldownResult = {
  cooldownUntil: string | null;
  remainingSeconds: number;
  isCoolingDown: boolean;
  isFinished: boolean;
  hasStarted: boolean;
  start: (cooldownUntil: string | null) => void;
  reset: () => void;
  syncFromTimestamp: (cooldownUntil: string | null) => void;
};

function getRemainingSeconds(cooldownUntil: string | null): number {
  if (!cooldownUntil) return 0;
  const targetTimestamp = Date.parse(cooldownUntil);
  if (!Number.isFinite(targetTimestamp)) return 0;
  return Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
}

export function useOtpCooldown(timerId: string): UseOtpCooldownResult {
  const [tick, setTick] = useState(0);
  const timerEntry = useOtpCooldownStore((state) => state.getTimer(timerId));
  const setTimer = useOtpCooldownStore((state) => state.setTimer);
  const clearTimer = useOtpCooldownStore((state) => state.clearTimer);

  const cooldownUntil = timerEntry?.cooldownUntil ?? null;
  const hasStarted = Boolean(timerEntry?.lastTriggeredAt);
  const remainingSeconds = useMemo(
    () => getRemainingSeconds(cooldownUntil),
    [cooldownUntil, tick],
  );

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }
    const interval = window.setInterval(() => {
      setTick((currentTick) => currentTick + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [remainingSeconds]);

  return {
    cooldownUntil,
    remainingSeconds,
    isCoolingDown: remainingSeconds > 0,
    isFinished: hasStarted && remainingSeconds <= 0,
    hasStarted,
    start: (nextCooldownUntil: string | null) => {
      setTimer(timerId, nextCooldownUntil);
      setTick((currentTick) => currentTick + 1);
    },
    syncFromTimestamp: (nextCooldownUntil: string | null) => {
      setTimer(timerId, nextCooldownUntil);
      setTick((currentTick) => currentTick + 1);
    },
    reset: () => {
      clearTimer(timerId);
      setTick((currentTick) => currentTick + 1);
    },
  };
}
