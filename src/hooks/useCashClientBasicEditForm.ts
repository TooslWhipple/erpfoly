import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getClientInformationSection,
  updateClientInformationSection,
} from "@/services/clients.service";
import { sendClientOtp, verifyClientOtp } from "@/services/clientOtp.service";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useOtpCooldown } from "@/hooks/common/useOtpCooldown";
import {
  normalizeMxPhone,
  isValidMxPhone,
} from "@/hooks/credit-applications/tabs/fieldValidation";
import type {
  BasicInformationFormErrors,
  BasicInformationFormValues,
} from "@/types/credit-application-form.types";

const VERIFIED_SECURITY_CODE_VALUE = "Verificado";

const EMPTY: BasicInformationFormValues = {
  firstName: "",
  lastName: "",
  secondLastName: "",
  birthDate: "",
  maritalStatus: "",
  curp: "",
  rfc: "",
  email: "",
  whatsappNumber: "",
  securityCode: "",
};

export function useCashClientBasicEditForm(clientId: number) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [values, setValues] = useState<BasicInformationFormValues>(EMPTY);
  const [errors, setErrors] = useState<BasicInformationFormErrors>({});
  const [initialPhone, setInitialPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSecurityCodeValid, setIsSecurityCodeValid] = useState<boolean | null>(
    null
  );
  const [validatingSecurityCode, setValidatingSecurityCode] = useState(false);
  const otpCooldown = useOtpCooldown(`cash-client-edit:${clientId}:whatsapp-otp`);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getClientInformationSection(clientId, "basic");
        const data = unwrapOrThrow(result).data as {
          name?: string;
          lastName?: string;
          secondLastName?: string;
          email?: string;
          phoneNumber?: string;
          phoneVerifiedAt?: string | Date | null;
        };
        if (cancelled) return;
        const phone = (data.phoneNumber ?? "").trim();
        // Existing on-file phone is treated as verified (same as credit edit).
        const phoneIsVerified =
          Boolean(data.phoneVerifiedAt) || phone.length > 0;
        setInitialPhone(phone);
        setValues({
          ...EMPTY,
          firstName: data.name ?? "",
          lastName: data.lastName ?? "",
          secondLastName: data.secondLastName ?? "",
          email: data.email ?? "",
          whatsappNumber: phone,
          securityCode: phoneIsVerified ? VERIFIED_SECURITY_CODE_VALUE : "",
        });
        setIsSecurityCodeValid(phoneIsVerified ? true : null);
        setErrors({});
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const setFieldValue = useCallback(
    (field: keyof BasicInformationFormValues, value: string) => {
      const nextValue =
        field === "whatsappNumber"
          ? normalizeMxPhone(value)
          : field === "securityCode"
            ? value.replace(/\D/g, "").slice(0, 6)
            : value;
      setValues((prev) => ({
        ...prev,
        [field]: nextValue,
        ...(field === "whatsappNumber" ? { securityCode: "" } : {}),
      }));
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        ...(field === "whatsappNumber" ? { securityCode: undefined } : {}),
      }));
      if (field === "whatsappNumber") {
        setIsSecurityCodeValid(null);
        otpCooldown.reset();
      }
      if (field === "securityCode") {
        setIsSecurityCodeValid(null);
      }
    },
    [otpCooldown]
  );

  const phoneChanged =
    values.whatsappNumber.trim() !== initialPhone.trim();

  const hasValidWhatsappNumber = useMemo(
    () => isValidMxPhone(values.whatsappNumber),
    [values.whatsappNumber]
  );
  const hasSecurityCodeInput = values.securityCode.trim().length > 0;
  const isSecurityCodeFieldDisabled =
    !hasValidWhatsappNumber || isSecurityCodeValid === true;
  const otpActionLabel = useMemo(() => {
    if (isSecurityCodeValid === true) return "Validado";
    if (hasSecurityCodeInput) return "Validar";
    if (otpCooldown.isCoolingDown) {
      return `Reenviar (${otpCooldown.remainingSeconds}s)`;
    }
    return otpCooldown.hasStarted ? "Reenviar" : "Enviar";
  }, [
    hasSecurityCodeInput,
    isSecurityCodeValid,
    otpCooldown.hasStarted,
    otpCooldown.isCoolingDown,
    otpCooldown.remainingSeconds,
  ]);
  const isOtpActionDisabled =
    validatingSecurityCode ||
    !hasValidWhatsappNumber ||
    isSecurityCodeValid === true ||
    (otpCooldown.isCoolingDown && !hasSecurityCodeInput);

  const validateSecurityCode = useCallback(async (): Promise<boolean> => {
    if (!isValidMxPhone(values.whatsappNumber)) {
      setErrors((prev) => ({
        ...prev,
        whatsappNumber: "El número de WhatsApp debe tener 10 dígitos",
      }));
      return false;
    }
    if (isSecurityCodeValid) return true;

    const shouldSendOtp =
      !otpCooldown.hasStarted ||
      (!otpCooldown.isCoolingDown && values.securityCode.trim().length === 0);
    setValidatingSecurityCode(true);
    try {
      if (shouldSendOtp) {
        const response = await sendClientOtp(values.whatsappNumber);
        otpCooldown.syncFromTimestamp(response.cooldownUntil);
        setIsSecurityCodeValid(response.verified ? true : null);
        return true;
      }
      if (!values.securityCode.trim()) {
        setErrors((prev) => ({
          ...prev,
          securityCode: "Código de seguridad es requerido",
        }));
        setIsSecurityCodeValid(false);
        return false;
      }
      const response = await verifyClientOtp(
        values.whatsappNumber,
        values.securityCode
      );
      if (!response) {
        setIsSecurityCodeValid(false);
        return false;
      }
      otpCooldown.syncFromTimestamp(response.cooldownUntil);
      setIsSecurityCodeValid(response.verified);
      if (response.verified) {
        setValues((prev) => ({
          ...prev,
          securityCode: VERIFIED_SECURITY_CODE_VALUE,
        }));
      }
      return response.verified;
    } catch (otpError) {
      showError(getApiErrorMessage(otpError));
      setIsSecurityCodeValid(false);
      return false;
    } finally {
      setValidatingSecurityCode(false);
    }
  }, [
    isSecurityCodeValid,
    otpCooldown,
    showError,
    values.securityCode,
    values.whatsappNumber,
  ]);

  const handleSave = useCallback(async () => {
    const nextErrors: BasicInformationFormErrors = {};
    if (!values.firstName.trim()) {
      nextErrors.firstName = "Nombre(s) es requerido";
    }
    if (!values.lastName.trim()) {
      nextErrors.lastName = "Primer apellido es requerido";
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "Correo electrónico inválido";
    }
    if (values.whatsappNumber && !isValidMxPhone(values.whatsappNumber)) {
      nextErrors.whatsappNumber = "El número de WhatsApp debe tener 10 dígitos";
    }
    if (phoneChanged && !isSecurityCodeValid) {
      nextErrors.securityCode =
        "Debes validar el código de seguridad del WhatsApp.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return false;
    }

    setSaving(true);
    try {
      const result = await updateClientInformationSection(clientId, "basic", {
        cashBasic: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          secondLastName: values.secondLastName.trim() || undefined,
          email: values.email.trim() || undefined,
          whatsappNumber: values.whatsappNumber.trim() || undefined,
        },
      });
      unwrapOrThrow(result);
      showSuccess(result.data?.message ?? "Información actualizada.");
      setInitialPhone(values.whatsappNumber.trim());
      return true;
    } catch (saveError) {
      showError(getApiErrorMessage(saveError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    clientId,
    isSecurityCodeValid,
    phoneChanged,
    showError,
    showSuccess,
    values,
  ]);

  return {
    loading,
    saving,
    error,
    values,
    errors,
    setFieldValue,
    isSecurityCodeValid,
    validatingSecurityCode,
    otpActionLabel,
    isOtpActionDisabled,
    isSecurityCodeFieldDisabled,
    validateSecurityCode,
    handleSave,
  };
}
