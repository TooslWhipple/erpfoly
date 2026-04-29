import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OtpCooldownEntry = {
  cooldownUntil: string | null;
  lastTriggeredAt: string | null;
  updatedAt: string;
};

type OtpCooldownState = {
  timers: Record<string, OtpCooldownEntry>;
  getTimer: (timerId: string) => OtpCooldownEntry | null;
  setTimer: (timerId: string, cooldownUntil: string | null) => void;
  clearTimer: (timerId: string) => void;
};

export const useOtpCooldownStore = create<OtpCooldownState>()(
  persist(
    (set, get) => ({
      timers: {},
      getTimer: (timerId: string) => {
        return get().timers[timerId] ?? null;
      },
      setTimer: (timerId: string, cooldownUntil: string | null) => {
        set((state) => ({
          timers: {
            ...state.timers,
            [timerId]: {
              cooldownUntil,
              lastTriggeredAt: cooldownUntil ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },
      clearTimer: (timerId: string) => {
        set((state) => {
          const nextTimers = { ...state.timers };
          delete nextTimers[timerId];
          return { timers: nextTimers };
        });
      },
    }),
    {
      name: "otp-cooldown-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
