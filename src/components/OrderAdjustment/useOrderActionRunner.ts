import { useCallback, useState } from "react";
import type { ApiResult } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { isStaleOrderErrorCode } from "@/utils/orderStatus";

/**
 * Ejecuta una acción sobre un pedido con aviso de éxito o error. Ante un 409 de
 * estado cambiado refresca el detalle: la pantalla estaba desfasada.
 * Devuelve `true` cuando el diálogo ya no tiene nada que hacer (éxito o desfase).
 */
export function useOrderActionRunner(onChanged: () => void) {
  const { showSuccess, showError } = useSnackbarStore();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (
      action: () => Promise<ApiResult<unknown>>,
      successMessage: string,
    ): Promise<boolean> => {
      setBusy(true);
      try {
        const result = await action();
        if (result.error) {
          showError(result.error.message);
          if (isStaleOrderErrorCode(result.error.errorCode)) {
            onChanged();
            return true;
          }
          return false;
        }
        showSuccess(successMessage);
        onChanged();
        return true;
      } finally {
        setBusy(false);
      }
    },
    [onChanged, showError, showSuccess],
  );

  return { run, busy };
}
