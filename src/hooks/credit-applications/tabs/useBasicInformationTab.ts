import { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkIdentityConflicts,
  sendCreditApplicationOtp,
  verifyCreditApplicationOtp,
} from "@/services/creditApplications.service";
import { useOtpCooldown } from "@/hooks/common/useOtpCooldown";
import { getApiErrorMessage } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  BasicInformationFormErrors,
  BasicInformationFormValues,
} from "@/types/credit-application-form.types";
import {
  cleanAlphaNumeric,
  isAdultBirthDate,
  isValidCurp,
  isValidMxPhone,
  isValidRfc,
  normalizeMxPhone,
} from "./fieldValidation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFIED_SECURITY_CODE_VALUE = "Verificado";

const SERVER_ERROR_FIELD_MAP: Record<string, keyof BasicInformationFormErrors> = {
  "basicInformation.firstName": "firstName",
  "basicInformation.lastName": "lastName",
  "basicInformation.secondLastName": "secondLastName",
  "basicInformation.birthDate": "birthDate",
  "basicInformation.maritalStatusId": "maritalStatus",
  "basicInformation.curp": "curp",
  "basicInformation.rfc": "rfc",
  "basicInformation.email": "email",
  "basicInformation.whatsappNumber": "whatsappNumber",
};

export function parseBasicInformationServerErrors(
  validationMessages: string[]
): Partial<BasicInformationFormErrors> {
  const errors: Partial<BasicInformationFormErrors> = {};
  for (const msg of validationMessages) {
    const match = msg.match(/^([a-zA-Z0-9_.]+)\s+(.+)$/);
    if (!match) continue;
    const [, fieldPath, errorMessage] = match;
    const localField = SERVER_ERROR_FIELD_MAP[fieldPath];
    if (localField) {
      const capitalized =
        errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
      errors[localField] = capitalized;
    }
  }
  return errors;
}

type BasicInformationTabOptions = {
  applicationId?: string;
  prepareForOtpSend?: (
    values: BasicInformationFormValues,
  ) => Promise<string | undefined>;
};

export function useBasicInformationTab(
  initialValues: BasicInformationFormValues,
  options?: BasicInformationTabOptions,
) {
  const prepareForOtpSend = options?.prepareForOtpSend;
  const showError = useSnackbarStore((s) => s.showError);
  const [values, setValues] = useState<BasicInformationFormValues>(initialValues);
  const [errors, setErrors] = useState<BasicInformationFormErrors>({});
  const [validatingSecurityCode, setValidatingSecurityCode] = useState(false);
  const [isSecurityCodeValid, setIsSecurityCodeValid] = useState<boolean | null>(null);
  const [resolvedApplicationId, setResolvedApplicationId] = useState<string | undefined>(
    options?.applicationId,
  );
  const activeApplicationId = options?.applicationId ?? resolvedApplicationId;
  const otpTimerId = useMemo(
    () => `credit-application:${activeApplicationId ?? "draft"}:whatsapp-otp`,
    [activeApplicationId],
  );
  const otpCooldown = useOtpCooldown(otpTimerId);
  const hasValidWhatsappNumber = useMemo(
    () => isValidMxPhone(values.whatsappNumber),
    [values.whatsappNumber],
  );
  const isSecurityCodeFieldDisabled = !hasValidWhatsappNumber || isSecurityCodeValid === true;
  const hasSecurityCodeInput = values.securityCode.trim().length > 0;
  const otpActionLabel = useMemo(() => {
    if (isSecurityCodeValid === true) {
      return "Validado";
    }
    if (hasSecurityCodeInput) {
      return "Validar";
    }
    if (otpCooldown.isCoolingDown) {
      return `Reenviar (${otpCooldown.remainingSeconds}s)`;
    }
    if (!otpCooldown.hasStarted) {
      return "Enviar";
    }
    return "Reenviar";
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

  useEffect(() => {
    if (options?.applicationId) {
      setResolvedApplicationId(options.applicationId);
    }
  }, [options?.applicationId]);

  const isDirty = useMemo(() => {
    return Object.values(values).some((value) => value.trim().length > 0);
  }, [values]);

  const setFieldValue = useCallback((field: keyof BasicInformationFormValues, value: string) => {
    const nextValue =
      field === "curp"
        ? cleanAlphaNumeric(value).slice(0, 18)
        : field === "rfc"
          ? cleanAlphaNumeric(value).slice(0, 13)
          : field === "whatsappNumber"
            ? normalizeMxPhone(value)
            : field === "securityCode"
              ? value.replace(/\D/g, "").slice(0, 6)
              : value;
    const nextValues = { ...values, [field]: nextValue };

    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "securityCode") {
      setIsSecurityCodeValid(null);
    }
    if (field === "whatsappNumber") {
      setIsSecurityCodeValid(null);
      otpCooldown.reset();
    }
    return nextValues;
  }, [otpCooldown, values]);

  const setValuesFromExternalSource = useCallback(
    (
      nextValues: BasicInformationFormValues,
      options?: { isSecurityCodeVerified?: boolean },
    ) => {
      setValues(nextValues);
      setErrors({});
      const shouldMarkAsVerified =
        options?.isSecurityCodeVerified ||
        nextValues.securityCode.trim().toLowerCase() ===
        VERIFIED_SECURITY_CODE_VALUE.toLowerCase();
      setIsSecurityCodeValid(shouldMarkAsVerified ? true : null);
    },
    [],
  );

  const setServerErrors = useCallback(
    (serverErrors: Partial<BasicInformationFormErrors>) => {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    },
    [],
  );

  const validateValues = useCallback((silent?: boolean): boolean => {
    const nextErrors: BasicInformationFormErrors = {};

    if (!values.firstName.trim()) nextErrors.firstName = "Nombre(s) es requerido";
    if (!values.lastName.trim()) nextErrors.lastName = "Primer apellido es requerido";
    if (!values.birthDate.trim()) nextErrors.birthDate = "Fecha de nacimiento es requerida";
    else if (!isAdultBirthDate(values.birthDate)) {
      nextErrors.birthDate = "La fecha de nacimiento debe corresponder a una persona mayor de edad";
    }
    if (!values.maritalStatus.trim()) nextErrors.maritalStatus = "Estado civil es requerido";
    if (!values.curp.trim()) nextErrors.curp = "CURP es requerido";
    else if (!isValidCurp(values.curp)) nextErrors.curp = "CURP inválido";
    if (!values.rfc.trim()) nextErrors.rfc = "RFC es requerido";
    else if (!isValidRfc(values.rfc)) nextErrors.rfc = "RFC inválido";

    if (!values.email.trim()) {
      nextErrors.email = "Correo electrónico es requerido";
    } else if (!EMAIL_REGEX.test(values.email)) {
      nextErrors.email = "Correo electrónico inválido";
    }

    if (!values.whatsappNumber.trim()) {
      nextErrors.whatsappNumber = "Número de Whatsapp es requerido";
    } else if (!isValidMxPhone(values.whatsappNumber)) {
      nextErrors.whatsappNumber = "El número de Whatsapp debe tener 10 dígitos";
    }

    if (!values.securityCode.trim() && !isSecurityCodeValid) {
      nextErrors.securityCode = "Código de seguridad es requerido";
    } else if (values.securityCode.trim().length < 6 && !isSecurityCodeValid) {
      nextErrors.securityCode = "El código de seguridad debe tener 6 dígitos";
    }

    if (!isSecurityCodeValid) {
      nextErrors.securityCode =
        nextErrors.securityCode ?? "Debes validar el código de seguridad";
    }

    if (!silent) {
      setErrors(nextErrors);
    }
    return Object.keys(nextErrors).length === 0;
  }, [isSecurityCodeValid, values]);

  const validateCurrentSecurityCode = useCallback(async (): Promise<boolean> => {
    if (!hasValidWhatsappNumber) {
      setErrors((prev) => ({
        ...prev,
        whatsappNumber: "El número de Whatsapp debe tener 10 dígitos",
      }));
      return false;
    }
    if (isSecurityCodeValid) {
      return true;
    }

    const shouldSendOtp = !otpCooldown.hasStarted || (!otpCooldown.isCoolingDown && values.securityCode.trim().length === 0);
    setValidatingSecurityCode(true);
    
    try {
      let targetApplicationId = activeApplicationId;
      if (shouldSendOtp && prepareForOtpSend) {
        const preparedApplicationId = await prepareForOtpSend(values);
        if (preparedApplicationId) {
          setResolvedApplicationId(preparedApplicationId);
          targetApplicationId = preparedApplicationId;
        }
      }

      if (!targetApplicationId) {
        setErrors((prev) => ({
          ...prev,
          securityCode: "Guarda la solicitud para poder enviar el OTP",
        }));
        return false;
      }

      if (shouldSendOtp) {
        const response = await sendCreditApplicationOtp(targetApplicationId, values.whatsappNumber);
        otpCooldown.syncFromTimestamp(response.cooldownUntil);
        setIsSecurityCodeValid(response.verified ? true : null);
        setErrors((prev) => ({ ...prev, securityCode: undefined }));

        return true;
      }

      if (!values.securityCode.trim()) {
        setErrors((prev) => ({ ...prev, securityCode: "Código de seguridad es requerido" }));
        setIsSecurityCodeValid(false);
        return false;
      }

      if (values.securityCode.trim().length < 6) {
        setErrors((prev) => ({ ...prev, securityCode: "El código de seguridad debe tener 6 dígitos" }));
        setIsSecurityCodeValid(false);
        return false;
      }

      const response = await verifyCreditApplicationOtp(targetApplicationId, values.whatsappNumber, values.securityCode);
      if (!response) {
        return false;
      }

      otpCooldown.syncFromTimestamp(response.cooldownUntil);
      setIsSecurityCodeValid(response.verified);
      return response.verified;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      showError(errorMessage);
      setIsSecurityCodeValid(false);
      return false;
    } finally {
      setValidatingSecurityCode(false);
    }
  }, [
    hasValidWhatsappNumber,
    isSecurityCodeValid,
    activeApplicationId,
    prepareForOtpSend,
    otpCooldown,
    values,
    showError,
  ]);

  const getIdentityConflictError = useCallback(
    (
      field: keyof Pick<BasicInformationFormValues, "curp" | "rfc">,
      hasExistingClient: boolean,
      hasExistingApplication: boolean
    ): string | undefined => {
      if (!hasExistingClient && !hasExistingApplication) {
        return undefined;
      }

      const fieldLabel = field.toUpperCase();
      if (hasExistingClient && hasExistingApplication) {
        return `Ya existe un cliente y una solicitud con este ${fieldLabel}.`;
      }
      if (hasExistingClient) {
        return `Ya existe un cliente con este ${fieldLabel}.`;
      }
      return `Ya existe una solicitud con este ${fieldLabel}.`;
    },
    []
  );

  const validateIdentityField = useCallback(
    async (
      field: keyof Pick<BasicInformationFormValues, "curp" | "rfc">,
      currentApplicationId?: string
    ): Promise<boolean> => {
      const currentValue = values[field].trim();
      if (!currentValue) return false;

      try {
        const conflicts = await checkIdentityConflicts(currentValue, currentApplicationId);
        const conflictError = getIdentityConflictError(
          field,
          conflicts.hasExistingClient,
          conflicts.hasExistingApplication
        );

        setErrors((prev) => ({ ...prev, [field]: conflictError }));
        return !conflictError;
      } catch {
        setErrors((prev) => ({
          ...prev,
          [field]: `No se pudo validar el ${field.toUpperCase()}, intenta nuevamente.`,
        }));
        return false;
      }
    },
    [getIdentityConflictError, values]
  );

  const validateIdentityUniqueness = useCallback(
    async (currentApplicationId?: string): Promise<boolean> => {
      const [curpIsValid, rfcIsValid] = await Promise.all([
        validateIdentityField("curp", currentApplicationId),
        validateIdentityField("rfc", currentApplicationId),
      ]);

      return curpIsValid && rfcIsValid;
    },
    [validateIdentityField]
  );

  return {
    values,
    errors,
    isDirty,
    validatingSecurityCode,
    isSecurityCodeValid,
    otpActionLabel,
    isOtpActionDisabled,
    isSecurityCodeFieldDisabled,
    setFieldValue,
    setValuesFromExternalSource,
    setServerErrors,
    validateValues,
    validateCurrentSecurityCode,
    validateIdentityField,
    validateIdentityUniqueness,
  };
}
