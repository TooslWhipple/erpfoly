import type { ApiError } from "@/lib/axios";
import type { HandoverErrorCode } from "@/types/saleHandover.types";

function formatTime(iso: unknown): string {
  if (typeof iso !== "string") return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/** Mensaje claro para el operador a partir del `errorCode` y `data` del backend. */
export function handoverErrorMessage(error: ApiError): string {
  const code = error.errorCode as HandoverErrorCode | undefined;
  const data = error.data ?? {};
  switch (code) {
    case "OTP_INVALID": {
      const left = data.attemptsLeft;
      return typeof left === "number"
        ? `Código incorrecto. Te quedan ${left} ${left === 1 ? "intento" : "intentos"}.`
        : "Código incorrecto.";
    }
    case "OTP_EXPIRED":
      return "El código venció. Envía uno nuevo.";
    case "OTP_MAX_ATTEMPTS":
      return "Se agotaron los intentos. Envía un código nuevo o usa la autorización de respaldo.";
    case "OTP_NOT_FOUND":
      return "No hay un código vigente para esta venta. Envía uno nuevo.";
    case "OTP_COOLDOWN":
      return "Ya se envió un código hace poco. Espera para reenviarlo.";
    case "OTP_LOCKED": {
      const until = formatTime(data.lockedUntil);
      return until
        ? `Demasiados envíos. Podrás pedir un código a las ${until}; mientras, usa la autorización de respaldo.`
        : "Demasiados envíos. Usa la autorización de respaldo.";
    }
    case "OTP_SEND_FAILED":
      return "No se pudo enviar el código por WhatsApp. Intenta de nuevo o usa la autorización de respaldo.";
    case "RECEIVER_NOT_THIRD_PARTY":
      return "Quien recibe es el titular: no requiere código.";
    case "SUPERVISOR_REJECTED":
      return "Credenciales no válidas o sin permiso para autorizar en esta sucursal.";
    case "HOLD_NOT_EXPIRED":
      return "El resguardo no está vencido: no requiere autorización.";
    case "BRANCH_FORBIDDEN":
      return "No tienes acceso a esta sucursal.";
    case "SALE_NOT_FOUND":
      return "No se encontró la venta.";
    case "INVALID_FILE":
      return "El archivo no es válido. Usa una imagen JPG o PNG de hasta 5 MB.";
    case "SIGNATURE_REQUIRED":
      return "Falta la firma de quien recibe.";
    case "DUPLICATE_LINE":
      return "Hay un renglón repetido en la entrega. Recarga la venta.";
    case "AUTHORIZATION_REQUIRED":
      return data.purpose === "EXPIRED_HOLD"
        ? "El resguardo está vencido: pide la autorización de un responsable."
        : "Falta validar la identidad de quien recibe.";
    case "AUTHORIZATION_INVALID":
      return data.purpose === "EXPIRED_HOLD"
        ? "La autorización del resguardo vencido ya no es válida. Solicítala de nuevo."
        : "La validación de identidad ya no es válida. Repítela.";
    case "HANDOVER_BLOCKED":
      return "La venta ya no se puede entregar. Recarga para ver el motivo.";
    case "QUANTITY_EXCEEDS_READY":
      return "Una cantidad supera lo listo para entregar. Se recargó la venta; revisa las cantidades.";
    case "HOLD_NOT_FOUND":
      return "No se encontró el resguardo o no pertenece a tus sucursales.";
    case "HOLD_SCOPE_FORBIDDEN":
      return "Tu rol no puede realizar esta acción sobre el resguardo.";
    case "HOLD_NOT_EXTENDABLE":
      return "El resguardo ya no se puede prorrogar. Se actualizó la lista.";
    case "HOLD_NOT_RELEASABLE":
      return "No se puede regularizar: la venta no tiene cliente al que abonar el saldo a favor, o el resguardo ya no está vencido.";
    case "EXTENSION_OUT_OF_RANGE": {
      const max = typeof data.maxDate === "string" ? data.maxDate : "";
      return max
        ? `La fecha excede el máximo permitido (${max.slice(0, 10)}).`
        : "La fecha de prórroga está fuera del rango permitido.";
    }
    case "IDEMPOTENCY_KEY_REUSED":
      return "La entrega cambió desde el último intento. Vuelve a confirmar.";
    default:
      return error.message || "Ocurrió un error inesperado.";
  }
}

/** Errores tras los que conviene recargar el detalle de la venta. */
export function shouldReloadDetail(error: ApiError): boolean {
  return (
    error.errorCode === "QUANTITY_EXCEEDS_READY" ||
    error.errorCode === "HANDOVER_BLOCKED"
  );
}
