import { useEffect, useState } from "react";
import { IconButton, useTheme } from "@mui/material";
import { Download } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };
  if (navigatorWithStandalone.standalone) return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  const isClassicIos = /iPad|iPhone|iPod/.test(userAgent);
  const isIpadOs =
    window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return isClassicIos || isIpadOs;
}

export function InstallAppControl() {
  const theme = useTheme();
  const [isStandalone, setIsStandalone] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());
    setIsIos(isIosDevice());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isStandalone) return null;
  if (!installPrompt && !isIos) return null;

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }
      return;
    }

    setIosHelpOpen(true);
  };

  return (
    <>
      <IconButton
        size="small"
        color="inherit"
        onClick={() => {
          void handleInstall();
        }}
        aria-label="Instalar aplicación"
        sx={{ width: 28, height: 28, flexShrink: 0 }}
      >
        <Download size={16} color={theme.palette.text.secondary} />
      </IconButton>
      <ConfirmModal
        open={iosHelpOpen}
        onClose={() => setIosHelpOpen(false)}
        onConfirm={() => setIosHelpOpen(false)}
        type="primary"
        title="Instalar Folysoft"
        description="En Safari, toca Compartir y luego Añadir a pantalla de inicio. La app se abrirá a pantalla completa, sin la barra del navegador."
        cancelLabel="Cerrar"
        confirmLabel="Entendido"
      />
    </>
  );
}
