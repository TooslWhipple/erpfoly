import { useState, useCallback, useMemo } from "react";
import { Button, Stack, Switch, FormControlLabel, Grid, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Check, CircleAlert, ShieldCheck } from "lucide-react";
import { SideModal } from "@/components/SideModal/SideModal";
import { TabFilters } from "@/components/TabFilters";
import type { TabOption } from "@/components/TabFilters";
import { FormTextField } from "@/components/Form";
import { PostalCodeSettlementFields } from "@/components/CreditApplicationForm/PostalCodeSettlementFields";
import { BillingFieldsForm } from "@/components/BillingFieldsForm";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { useCreateCashClientForm } from "@/hooks/useCreateCashClientForm";
import { createCashClient } from "@/services/cashClients.service";
import type { CreateCashClientTab } from "@/hooks/useCreateCashClientForm";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getApiErrorMessage } from "@/lib/axios";
import { sendClientOtp, verifyClientOtp } from "@/services/clientOtp.service";
import { useOtpCooldown } from "@/hooks/common/useOtpCooldown";
import { geocodeAddress } from "@/utils/geocodeAddress";
import { theme } from "@/styles/theme";
import type { Client } from "@/services/clients.service";

const CREATE_CLIENT_TABS: TabOption[] = [
  { label: "Información básica", value: "basic" },
  { label: "Dirección", value: "address" },
  { label: "Facturación", value: "billing" },
];

interface CreateCashClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (client: Client) => void;
}

export function CreateCashClientModal({
  open,
  onClose,
  onSuccess,
}: CreateCashClientModalProps) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const {
    activeTab,
    setActiveTab,
    values,
    basicErrors,
    addressErrors,
    billingErrors,
    setBasicValue,
    setAddressValue,
    setBillingValue,
    setBasicFieldError,
    resetForm,
    validateBasicTab,
  } = useCreateCashClientForm();

  const [isSaving, setIsSaving] = useState(false);
  const [isSecurityCodeValid, setIsSecurityCodeValid] = useState<boolean | null>(null);
  const [validatingSecurityCode, setValidatingSecurityCode] = useState(false);
  const otpCooldown = useOtpCooldown("cash-client-creation:whatsapp-otp");

  const addressNeighborhoodsQuery = useNeighborhoodsByPostalCode(
    values.address.postalCode
  );

  const addressNeighborhoods = addressNeighborhoodsQuery.data ?? [];
  const addressNeighborhoodsLoading = addressNeighborhoodsQuery.isPending;

  const createMutation = useMutation({
    mutationFn: createCashClient,
    onSuccess: (result) => {
      if (result.data) {
        showSuccess(result.data.message);
        resetForm();
        setIsSecurityCodeValid(null);
        setValidatingSecurityCode(false);
        otpCooldown.reset();
        onSuccess?.(result.data);
        onClose();
      }
    },
    onError: (error) => {
      showError(getApiErrorMessage(error));
    },
  });

  const handleClose = () => {
    if (!isSaving) {
      resetForm();
      setIsSecurityCodeValid(null);
      setValidatingSecurityCode(false);
      otpCooldown.reset();
      onClose();
    }
  };

  const handleContinueBasic = () => {
    if (!validateBasicTab(isSecurityCodeValid)) {
      showError("Completa la información básica requerida.");
      return;
    }
    setActiveTab("address");
  };

  const validateSecurityCode = useCallback(async (): Promise<boolean> => {
    const phoneNumber = values.basic.phoneNumber.trim();
    if (phoneNumber.length !== 10) {
      setBasicFieldError(
        "phoneNumber",
        "El número de WhatsApp debe tener 10 dígitos",
      );
      return false;
    }

    if (isSecurityCodeValid) {
      setBasicFieldError("securityCode", undefined);
      return true;
    }

    const shouldSendOtp =
      !otpCooldown.hasStarted ||
      (!otpCooldown.isCoolingDown && values.basic.securityCode.trim().length === 0);
    setValidatingSecurityCode(true);

    try {
      if (shouldSendOtp) {
        const response = await sendClientOtp(phoneNumber);
        otpCooldown.syncFromTimestamp(response.cooldownUntil);
        setIsSecurityCodeValid(response.verified ? true : null);
        setBasicFieldError("securityCode", undefined);
        return true;
      }

      if (!values.basic.securityCode.trim()) {
        setBasicFieldError("securityCode", "Código de seguridad es requerido");
        setIsSecurityCodeValid(false);
        return false;
      }

      if (values.basic.securityCode.trim().length < 6) {
        setBasicFieldError(
          "securityCode",
          "El código de seguridad debe tener 6 dígitos",
        );
        setIsSecurityCodeValid(false);
        return false;
      }

      const response = await verifyClientOtp(
        phoneNumber,
        values.basic.securityCode
      );
      if (!response) {
        return false;
      }

      otpCooldown.syncFromTimestamp(response.cooldownUntil);
      setIsSecurityCodeValid(response.verified);
      if (response.verified) {
        setBasicFieldError("securityCode", undefined);
      } else {
        setBasicFieldError("securityCode", "Código de seguridad inválido");
      }
      return response.verified;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      showError(errorMessage);
      setIsSecurityCodeValid(false);
      setBasicFieldError("securityCode", errorMessage);
      return false;
    } finally {
      setValidatingSecurityCode(false);
    }
  }, [
    values.basic.phoneNumber,
    values.basic.securityCode,
    isSecurityCodeValid,
    otpCooldown,
    setBasicFieldError,
    showError,
  ]);

  const handleContinueAddress = () => {
    setActiveTab("billing");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as CreateCashClientTab);
  };

  const handleUseClientPhoneToggle = (checked: boolean) => {
    setAddressValue("useClientPhone", checked);
    if (checked) {
      // Copiar datos del cliente
      const fullName = `${values.basic.firstName} ${values.basic.lastSurname}${values.basic.secondSurname ? ` ${values.basic.secondSurname}` : ""}`;
      setAddressValue("receiverPhone", values.basic.phoneNumber);
      setAddressValue("receiverName", fullName.trim());
    }
  };

  const handleSave = async () => {
    if (!validateBasicTab(isSecurityCodeValid)) {
      setActiveTab("basic");
      showError("Completa la información básica requerida.");
      return;
    }

    setIsSaving(true);
    try {
      // Geocodificar dirección para obtener coordenadas
      let latitude: string | undefined;
      let longitude: string | undefined;

      if (values.address.street && values.address.neighborhoodFullCode) {
        const neighborhood = addressNeighborhoods.find(
          (n) => n.full_code === values.address.neighborhoodFullCode
        );
        const geoResult = await geocodeAddress({
          street: values.address.street,
          externalNumber: values.address.externalNumber,
          neighborhoodName: neighborhood?.name,
          city: values.address.city,
          state: values.address.state,
          postalCode: values.address.postalCode,
        });

        if (geoResult) {
          latitude = geoResult.lat.toString();
          longitude = geoResult.lng.toString();
        }
      }

      await createMutation.mutateAsync({
        firstName: values.basic.firstName,
        lastSurname: values.basic.lastSurname,
        secondSurname: values.basic.secondSurname || undefined,
        email: values.basic.email || undefined,
        phoneNumber: values.basic.phoneNumber || undefined,
        postalCode: values.address.postalCode || undefined,
        neighborhoodFullCode: values.address.neighborhoodFullCode || undefined,
        street: values.address.street || undefined,
        externalNumber: values.address.externalNumber || undefined,
        internalNumber: values.address.internalNumber || undefined,
        betweenStreets: values.address.betweenStreets || undefined,
        receiverPhone: values.address.receiverPhone || undefined,
        receiverName: values.address.receiverName || undefined,
        useClientPhone: values.address.useClientPhone,
        latitude,
        longitude,
        requiresInvoice: values.billing.requiresInvoice,
        rfc: values.billing.rfc || undefined,
        businessName: values.billing.businessName || undefined,
        taxRegimeId: values.billing.taxRegimeId
          ? parseInt(values.billing.taxRegimeId, 10)
          : undefined,
        cfdiUseId: values.billing.cfdiUseId
          ? parseInt(values.billing.cfdiUseId, 10)
          : undefined,
        fiscalPostalCode: values.billing.fiscalPostalCode || undefined,
        fiscalNeighborhoodFullCode:
          values.billing.fiscalNeighborhoodFullCode || undefined,
        fiscalStreet: values.billing.fiscalStreet || undefined,
        fiscalExternalNumber: values.billing.fiscalExternalNumber || undefined,
        sendInvoiceByEmail: values.billing.sendInvoiceByEmail,
        invoiceEmail: values.billing.invoiceEmail || undefined,
        invoiceWhatsappNumber: values.billing.invoiceWhatsappNumber || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasValidPhoneNumber = values.basic.phoneNumber.trim().length === 10;
  const isOtpActionDisabled =
    !hasValidPhoneNumber ||
    validatingSecurityCode ||
    (otpCooldown.isCoolingDown && values.basic.securityCode.trim().length === 0);
  const otpActionLabel = !otpCooldown.hasStarted
    ? "Enviar"
    : otpCooldown.isCoolingDown && values.basic.securityCode.trim().length === 0
      ? `Espera ${otpCooldown.remainingSeconds}s`
      : "Validar";
  const isSecurityCodeFieldDisabled =
    !hasValidPhoneNumber ||
    (!otpCooldown.hasStarted && values.basic.securityCode.trim().length === 0) ||
    isSecurityCodeValid === true;

  const tabsWithValidationState = useMemo(() => {
    const tabsWithErrors = new Set<CreateCashClientTab>();

    if (Object.values(basicErrors).some(Boolean)) {
      tabsWithErrors.add("basic");
    }
    if (Object.values(addressErrors).some(Boolean)) {
      tabsWithErrors.add("address");
    }
    if (Object.values(billingErrors).some(Boolean)) {
      tabsWithErrors.add("billing");
    }

    return CREATE_CLIENT_TABS.map((tab) => {
      const hasError = tabsWithErrors.has(tab.value as CreateCashClientTab);
      return {
        ...tab,
        label: hasError ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CircleAlert size={14} />
            <span>{tab.label}</span>
          </Stack>
        ) : (
          tab.label
        ),
        textColor: hasError ? theme.palette.app.chip.variants.error.color : undefined,
      };
    });
  }, [addressErrors, basicErrors, billingErrors]);

  const headerActions = (
    <Button
      variant="contained"
      onClick={handleSave}
      disabled={isSaving}
      sx={{ whiteSpace: "nowrap" }}
    >
      Guardar cliente
    </Button>
  );

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Nuevo cliente"
      description="Confirma los datos del cliente"
      headerActions={headerActions}
      maxWidth="lg"
      disableClose={isSaving}
    >
      <Stack spacing={3}>
        <TabFilters
          tabs={tabsWithValidationState}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

      {activeTab === "basic" && (
        <Stack spacing={3}>
          <FormTextField
            fullWidth
            required
            label="Nombres"
            placeholder="Jose Antonio"
            value={values.basic.firstName}
            onChange={(e) => setBasicValue("firstName", e.target.value)}
            error={Boolean(basicErrors.firstName)}
            helperText={basicErrors.firstName}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                required
                label="Primer Apellido"
                placeholder="Montes"
                value={values.basic.lastSurname}
                onChange={(e) => setBasicValue("lastSurname", e.target.value)}
                error={Boolean(basicErrors.lastSurname)}
                helperText={basicErrors.lastSurname}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Segundo Apellido"
                placeholder="Molina"
                value={values.basic.secondSurname}
                onChange={(e) => setBasicValue("secondSurname", e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack spacing={2}>
            <FormTextField
              fullWidth
              type="email"
              label="Correo electrónico"
              placeholder="Ingresa"
              value={values.basic.email}
              onChange={(e) => setBasicValue("email", e.target.value)}
              error={Boolean(basicErrors.email)}
              helperText={basicErrors.email}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField
                  fullWidth
                  label="Número de Whatsapp"
                  placeholder="Ingresa"
                  value={values.basic.phoneNumber}
                  onChange={(e) =>
                    setBasicValue(
                      "phoneNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  disabled={isSecurityCodeValid === true}
                  inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" }}
                  error={Boolean(basicErrors.phoneNumber)}
                  helperText={basicErrors.phoneNumber}
                />
              </Grid>
              <Grid container size={{ xs: "grow" }}>
                <Grid size={{ xs: "grow" }}>
                  <FormTextField
                    fullWidth
                    required={isSecurityCodeValid !== true && hasValidPhoneNumber}
                    label="Código de seguridad"
                    placeholder="Ingresa"
                    value={values.basic.securityCode}
                    onChange={(e) =>
                      setBasicValue(
                        "securityCode",
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    disabled={isSecurityCodeFieldDisabled}
                    inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
                    error={Boolean(basicErrors.securityCode)}
                    helperText={basicErrors.securityCode}
                  />
                </Grid>
                <Grid size={{ xs: "auto" }} alignSelf="flex-start" style={{ marginTop: 24 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ShieldCheck size={16} />}
                    onClick={validateSecurityCode}
                    disabled={isOtpActionDisabled}
                    sx={{ minWidth: 108, alignSelf: "stretch" }}
                  >
                    {validatingSecurityCode ? "Procesando..." : otpActionLabel}
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {isSecurityCodeValid && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Check size={14} />
                Código validado correctamente
              </Typography>
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={handleContinueBasic}
          >
            Continuar
          </Button>
        </Stack>
      )}

      {activeTab === "address" && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <PostalCodeSettlementFields
              postalCode={values.address.postalCode}
              neighborhoodFullCode={values.address.neighborhoodFullCode}
              state={values.address.state}
              city={values.address.city}
              postalCodeError={addressErrors.postalCode}
              neighborhoodError={addressErrors.neighborhoodFullCode}
              neighborhoods={addressNeighborhoods}
              neighborhoodsLoading={addressNeighborhoodsLoading}
              fieldKeys={{
                postalCode: "postalCode",
                neighborhoodFullCode: "neighborhoodFullCode",
                state: "state",
                city: "city",
              }}
              mergePatch={(patch) => {
                Object.entries(patch).forEach(([field, value]) => {
                  setAddressValue(
                    field as keyof typeof values.address,
                    value,
                  );
                });
              }}
            />
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Estado"
                placeholder="Selecciona"
                value={values.address.state}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Ciudad"
                placeholder="Seleccione"
                value={values.address.city}
                disabled
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <FormTextField
                fullWidth
                label="Calle"
                placeholder="Ingresa"
                value={values.address.street}
                onChange={(e) => setAddressValue("street", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormTextField
                fullWidth
                label="Número"
                placeholder="Ingresa"
                value={values.address.externalNumber}
                onChange={(e) => setAddressValue("externalNumber", e.target.value)}
              />
            </Grid>
          </Grid>

          <FormTextField
            fullWidth
            label="Entre calles"
            placeholder="Ingresa"
            value={values.address.betweenStreets}
            onChange={(e) => setAddressValue("betweenStreets", e.target.value)}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Núm. de teléfono de quién recibirá los artículos"
                placeholder="Ingresa"
                value={values.address.receiverPhone}
                onChange={(e) => setAddressValue("receiverPhone", e.target.value)}
                disabled={values.address.useClientPhone}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Nombre de quién recibe"
                placeholder="Ingresa"
                value={values.address.receiverName}
                onChange={(e) => setAddressValue("receiverName", e.target.value)}
                disabled={values.address.useClientPhone}
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Switch
                checked={values.address.useClientPhone}
                onChange={(e) => handleUseClientPhoneToggle(e.target.checked)}
              />
            }
            label="Utilizar número del cliente"
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleContinueAddress}
          >
            Continuar
          </Button>
        </Stack>
      )}

      {activeTab === "billing" && (
        <Stack spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={values.billing.requiresInvoice}
                onChange={(e) => setBillingValue("requiresInvoice", e.target.checked)}
              />
            }
            label={
              <Typography sx={{ color: "#2563EB", fontWeight: 500 }}>
                ¿Expedir factura?
              </Typography>
            }
          />

          {values.billing.requiresInvoice && (
            <Stack spacing={3}>
              <BillingFieldsForm
                values={values.billing}
                onChange={setBillingValue}
                whatsappFallbackNumber={values.basic.phoneNumber}
                errors={billingErrors}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                disabled={isSaving}
              >
                Guardar cliente
              </Button>
            </Stack>
          )}
        </Stack>
      )}
      </Stack>
    </SideModal>
  );
}
