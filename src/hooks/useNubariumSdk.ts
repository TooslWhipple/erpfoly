"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateSdkToken } from "@/services/nubarium.service";
import { ensureNavigatorMediaDevices } from "@/utils/nubariumSdk";

const NUBARIUM_SCRIPT_URLS = [
  "https://cdn.nubarium.com/nubSdk/nubSdk@latest/nubSdk-third.min.js",
  "https://cdn.nubarium.com/nubSdk/nubSdk@latest/nubSdk-biometrics.min.js",
] as const;

const DEFAULT_TOKEN_TTL_SECONDS = 1800;

let scriptsLoadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });
}

async function loadNubariumScripts(): Promise<void> {
  if (typeof window === "undefined") return;
  ensureNavigatorMediaDevices();
  if (typeof IdCapture !== "undefined" && typeof FaceCapture !== "undefined") return;

  if (!scriptsLoadPromise) {
    scriptsLoadPromise = NUBARIUM_SCRIPT_URLS.reduce(
      (chain, url) => chain.then(() => loadScript(url)),
      Promise.resolve(),
    );
  }

  await scriptsLoadPromise;

  if (typeof IdCapture === "undefined" || typeof FaceCapture === "undefined") {
    throw new Error("El SDK de Nubarium no quedó disponible en el navegador.");
  }
}

interface UseNubariumSdkOptions {
  enabled?: boolean;
  tokenTtlSeconds?: number;
}

interface UseNubariumSdkResult {
  isReady: boolean;
  isLoading: boolean;
  token: string | null;
  error: string | null;
  reloadToken: () => Promise<string | null>;
}

export function useNubariumSdk(options: UseNubariumSdkOptions = {}): UseNubariumSdkResult {
  const { enabled = true, tokenTtlSeconds = DEFAULT_TOKEN_TTL_SECONDS } = options;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const reloadToken = useCallback(async (): Promise<string | null> => {
    const nextToken = await generateSdkToken(tokenTtlSeconds);
    if (!nextToken) {
      setError("No se pudo obtener el token del SDK de Nubarium.");
      setToken(null);
      return null;
    }

    setToken(nextToken);
    setError(null);
    return nextToken;
  }, [tokenTtlSeconds]);

  useEffect(() => {
    if (!enabled) {
      setIsReady(false);
      setIsLoading(false);
      setToken(null);
      setError(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    const bootstrap = async () => {
      setIsLoading(true);
      setError(null);
      setIsReady(false);

      try {
        await loadNubariumScripts();
        const nextToken = await generateSdkToken(tokenTtlSeconds);
        if (cancelled || requestIdRef.current !== requestId) return;

        if (!nextToken) {
          setError("No se pudo obtener el token del SDK de Nubarium.");
          setToken(null);
          setIsReady(false);
          return;
        }

        setToken(nextToken);
        setIsReady(true);
      } catch (bootstrapError) {
        if (cancelled || requestIdRef.current !== requestId) return;
        const message =
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "No fue posible inicializar el SDK de Nubarium.";
        setError(message);
        setToken(null);
        setIsReady(false);
      } finally {
        if (!cancelled && requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [enabled, tokenTtlSeconds]);

  return {
    isReady,
    isLoading,
    token,
    error,
    reloadToken,
  };
}
