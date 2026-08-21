import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PreferredCamera = {
  deviceId: string;
  label: string;
};

type CameraPreferenceState = {
  preferredDeviceId: string | null;
  preferredLabel: string | null;
  setPreferredCamera: (camera: PreferredCamera | null) => void;
};

export const useCameraPreferenceStore = create<CameraPreferenceState>()(
  persist(
    (set) => ({
      preferredDeviceId: null,
      preferredLabel: null,
      setPreferredCamera: (camera) =>
        set(
          camera
            ? { preferredDeviceId: camera.deviceId, preferredLabel: camera.label }
            : { preferredDeviceId: null, preferredLabel: null },
        ),
    }),
    {
      name: "camera-preference-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferredDeviceId: state.preferredDeviceId,
        preferredLabel: state.preferredLabel,
      }),
    },
  ),
);

interface PersistHydrationApi {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
}

function getPersistApi(): PersistHydrationApi | null {
  const storeWithPersist = useCameraPreferenceStore as typeof useCameraPreferenceStore & {
    persist?: PersistHydrationApi;
  };
  return storeWithPersist.persist ?? null;
}

export function useCameraPreferenceHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => getPersistApi()?.onFinishHydration(onStoreChange) ?? (() => undefined),
    () => getPersistApi()?.hasHydrated() ?? true,
    () => false,
  );
}
