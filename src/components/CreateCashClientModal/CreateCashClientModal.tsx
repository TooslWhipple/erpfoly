import { useState, useCallback } from "react";
import { Box, Button, Stack, Tab, Tabs, Switch, FormControlLabel, Grid, Typography, MenuItem } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Check, ShieldCheck, QrCode } from "lucide-react";
import { SideModal } from "@/components/SideModal/SideModal";
import { FormTextField } from "@/components/Form";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { sanitizeMxPostalCodeInput } from "@/forms/validation/schemas";
import { useCreateCashClientForm } from "@/hooks/useCreateCashClientForm";
import { createCashClient } from "@/services/cashClients.service";
import type { CreateCashClientTab } from "@/hooks/useCreateCashClientForm";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getApiErrorMessage } from "@/lib/axios";
import { sendClientOtp, verifyClientOtp } from "@/services/clientOtp.service";
import { useOtpCooldown } from "@/hooks/common/useOtpCooldown";
import { geocodeAddress } from "@/utils/geocodeAddress";
import type { Client } from "@/services/clients.service";

const TAX_REGIME_OPTIONS = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente" },
  { value: "611", label: "611 - Ingresos por Dividendos" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
  { value: "614", label: "614 - Ingresos por intereses" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas" },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
];

const CFDI_USE_OPTIONS = [
  { value: "1", label: "G01 - Adquisición de mercancías" },
  { value: "2", label: "G02 - Devoluciones, descuentos o bonificaciones" },
  { value: "3", label: "G03 - Gastos en general" },
  { value: "4", label: "I01 - Construcciones" },
  { value: "5", label: "I02 - Mobiliario y equipo de oficina" },
  { value: "6", label: "I03 - Equipo de transporte" },
  { value: "7", label: "I04 - Equipo de cómputo y accesorios" },
  { value: "8", label: "I08 - Otra maquinaria y equipo" },
  { value: "9", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "10", label: "D02 - Gastos médicos por incapacidad o discapacidad" },
  { value: "11", label: "D03 - Gastos funerales" },
  { value: "12", label: "D04 - Donativos" },
  { value: "13", label: "D05 - Intereses reales efectivamente pagados por créditos hipotecarios" },
  { value: "14", label: "D07 - Primas por seguros de gastos médicos" },
  { value: "15", label: "D10 - Pagos por servicios educativos" },
  { value: "16", label: "P01 - Por definir" },
  { value: "17", label: "S01 - Sin efectos fiscales" },
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
    setBasicValue,
    setAddressValue,
    setBillingValue,
    resetForm,
    canContinueBasic,
  } = useCreateCashClientForm();

  const [isSaving, setIsSaving] = useState(false);
  const [isSecurityCodeValid, setIsSecurityCodeValid] = useState<boolean | null>(null);
  const [validatingSecurityCode, setValidatingSecurityCode] = useState(false);
  const [sendInvoiceByWhatsapp, setSendInvoiceByWhatsapp] = useState(false);
  const otpCooldown = useOtpCooldown("cash-client-creation:whatsapp-otp");

  const addressNeighborhoodsQuery = useNeighborhoodsByPostalCode(
    values.address.postalCode
  );
  const billingNeighborhoodsQuery = useNeighborhoodsByPostalCode(
    values.billing.fiscalPostalCode
  );

  const addressNeighborhoods = addressNeighborhoodsQuery.data ?? [];
  const addressNeighborhoodsLoading = addressNeighborhoodsQuery.isPending;
  const billingNeighborhoods = billingNeighborhoodsQuery.data ?? [];
  const billingNeighborhoodsLoading = billingNeighborhoodsQuery.isPending;

  const createMutation = useMutation({
    mutationFn: createCashClient,
    onSuccess: (result) => {
      if (result.data) {
        showSuccess(result.data.message);
        resetForm();
        setIsSecurityCodeValid(null);
        setValidatingSecurityCode(false);
        setSendInvoiceByWhatsapp(false);
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
      setSendInvoiceByWhatsapp(false);
      otpCooldown.reset();
      onClose();
    }
  };

  const handleContinueBasic = () => {
    if (canContinueBasic(isSecurityCodeValid)) {
      setActiveTab("address");
    }
  };

  const validateSecurityCode = useCallback(async (): Promise<boolean> => {
    const phoneNumber = values.basic.phoneNumber.trim();
    if (phoneNumber.length !== 10) {
      showError("El número de WhatsApp debe tener 10 dígitos");
      return false;
    }

    if (isSecurityCodeValid) {
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
        return true;
      }

      if (!values.basic.securityCode.trim()) {
        showError("Código de seguridad es requerido");
        setIsSecurityCodeValid(false);
        return false;
      }

      if (values.basic.securityCode.trim().length < 6) {
        showError("El código de seguridad debe tener 6 dígitos");
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
    values.basic.phoneNumber,
    values.basic.securityCode,
    isSecurityCodeValid,
    otpCooldown,
    showError,
  ]);

  const handleContinueAddress = () => {
    setActiveTab("billing");
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
    if (!canContinueBasic(isSecurityCodeValid)) {
      showError("Por favor completa todos los campos requeridos");
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

  const headerActions = (
    <Button
      variant="contained"
      onClick={handleSave}
      disabled={!canContinueBasic(isSecurityCodeValid) || isSaving}
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
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue as CreateCashClientTab)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="Información básica" value="basic" />
        <Tab label="Dirección" value="address" />
        <Tab label="Facturación" value="billing" />
      </Tabs>

      {activeTab === "basic" && (
        <Stack spacing={3}>
          <FormTextField
            fullWidth
            required
            label="Nombres"
            placeholder="Jose Antonio"
            value={values.basic.firstName}
            onChange={(e) => setBasicValue("firstName", e.target.value)}
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
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField
                  fullWidth
                  required={isSecurityCodeValid !== true}
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
                    onChange={(e) => setBasicValue("securityCode", e.target.value)}
                    disabled={isSecurityCodeFieldDisabled}
                    inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
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
            disabled={!canContinueBasic(isSecurityCodeValid)}
          >
            Continuar
          </Button>
        </Stack>
      )}

      {activeTab === "address" && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Código Postal
              </Typography>
              <FormTextField
                fullWidth
                required
                label=""
                placeholder="Ingresa"
                value={values.address.postalCode}
                onChange={(e) => {
                  const sanitized = sanitizeMxPostalCodeInput(e.target.value);
                  setAddressValue("postalCode", sanitized);
                  setAddressValue("neighborhoodFullCode", "-1");
                  setAddressValue("state", "");
                  setAddressValue("city", "");
                }}
                inputProps={{ inputMode: "numeric", maxLength: 5 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Colonia
              </Typography>
              <FormTextField
                fullWidth
                required
                select
                defaultValue="-1"
                label=""
                value={values.address.neighborhoodFullCode}
                onChange={(e) => {
                  const fullCode = e.target.value;
                  const row = addressNeighborhoods.find((item) => item.full_code === fullCode);
                  setAddressValue("neighborhoodFullCode", fullCode);
                  setAddressValue("state", row?.state_name ?? "");
                  setAddressValue("city", row?.municipality_name ?? "");
                }}
                disabled={values.address.postalCode.trim().length !== 5 || addressNeighborhoodsLoading}
              >
                <MenuItem value="-1">
                  {addressNeighborhoodsLoading ? "Cargando..." : values.address.postalCode.trim().length === 5 ? "Selecciona una colonia" : "Ingresa el código postal"}
                </MenuItem>
                {addressNeighborhoods.map((row) => (
                  <MenuItem key={row.full_code} value={row.full_code}>
                    {row.name}
                  </MenuItem>
                ))}
              </FormTextField>
            </Grid>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Calle y número"
                placeholder="Ingresa"
                value={values.address.street}
                onChange={(e) => setAddressValue("street", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                fullWidth
                label="Entre calles"
                placeholder="Ingresa"
                value={values.address.betweenStreets}
                onChange={(e) => setAddressValue("betweenStreets", e.target.value)}
              />
            </Grid>
          </Grid>

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

          <Button fullWidth variant="contained" onClick={handleContinueAddress}>
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
              <Button
                variant="outlined"
                startIcon={<QrCode size={20} />}
                sx={{ justifyContent: "flex-start", textTransform: "none", width: "fit-content" }}
              >
                Escanear QR de Constancia de Situación Fiscal
              </Button>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    fullWidth
                    label="RFC"
                    placeholder="Ingrese"
                    value={values.billing.rfc}
                    onChange={(e) => setBillingValue("rfc", e.target.value)}
                    inputProps={{ maxLength: 13 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    fullWidth
                    label="Nombre o Razón Social"
                    placeholder="Ingrese"
                    value={values.billing.businessName}
                    onChange={(e) => setBillingValue("businessName", e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    fullWidth
                    select
                    label="Régimen fiscal"
                    value={values.billing.taxRegimeId}
                    onChange={(e) => setBillingValue("taxRegimeId", e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {TAX_REGIME_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </FormTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    fullWidth
                    select
                    label="Uso de CFDI"
                    value={values.billing.cfdiUseId}
                    onChange={(e) => setBillingValue("cfdiUseId", e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {CFDI_USE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </FormTextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Código Postal
                  </Typography>
                  <FormTextField
                    fullWidth
                    required
                    label=""
                    placeholder="Ingresa"
                    value={values.billing.fiscalPostalCode}
                    onChange={(e) => {
                      const sanitized = sanitizeMxPostalCodeInput(e.target.value);
                      setBillingValue("fiscalPostalCode", sanitized);
                      setBillingValue("fiscalNeighborhoodFullCode", "-1");
                      setBillingValue("fiscalState", "");
                      setBillingValue("fiscalCity", "");
                    }}
                    inputProps={{ inputMode: "numeric", maxLength: 5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Colonia
                  </Typography>
                  <FormTextField
                    fullWidth
                    required
                    select
                    defaultValue="-1"
                    label=""
                    value={values.billing.fiscalNeighborhoodFullCode}
                    onChange={(e) => {
                      const fullCode = e.target.value;
                      const row = billingNeighborhoods.find((item) => item.full_code === fullCode);
                      setBillingValue("fiscalNeighborhoodFullCode", fullCode);
                      setBillingValue("fiscalState", row?.state_name ?? "");
                      setBillingValue("fiscalCity", row?.municipality_name ?? "");
                    }}
                    disabled={values.billing.fiscalPostalCode.trim().length !== 5 || billingNeighborhoodsLoading}
                  >
                    <MenuItem value="-1">
                      {billingNeighborhoodsLoading ? "Cargando..." : values.billing.fiscalPostalCode.trim().length === 5 ? "Selecciona una colonia" : "Ingresa el código postal"}
                    </MenuItem>
                    {billingNeighborhoods.map((row) => (
                      <MenuItem key={row.full_code} value={row.full_code}>
                        {row.name}
                      </MenuItem>
                    ))}
                  </FormTextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    fullWidth
                    label="Estado"
                    placeholder="Selecciona"
                    value={values.billing.fiscalState}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    fullWidth
                    label="Ciudad"
                    placeholder="Seleccione"
                    value={values.billing.fiscalCity}
                    disabled
                  />
                </Grid>
              </Grid>

              <FormTextField
                fullWidth
                label="Calle y número"
                placeholder="Ingresa"
                value={values.billing.fiscalStreet}
                onChange={(e) => setBillingValue("fiscalStreet", e.target.value)}
              />

              <Typography variant="body2" sx={{ fontWeight: 500, mt: 2 }}>
                Enviar factura a:
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={values.billing.sendInvoiceByEmail}
                  onChange={(e) =>
                    setBillingValue("sendInvoiceByEmail", e.target.checked)
                  }
                />
                <FormTextField
                  fullWidth
                  type="email"
                  placeholder="Ingrese Correo electrónico"
                  value={values.billing.invoiceEmail}
                  onChange={(e) => setBillingValue("invoiceEmail", e.target.value)}
                  disabled={!values.billing.sendInvoiceByEmail}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={sendInvoiceByWhatsapp}
                  onChange={(e) => {
                    setSendInvoiceByWhatsapp(e.target.checked);
                    setBillingValue(
                      "invoiceWhatsappNumber",
                      e.target.checked ? values.basic.phoneNumber : ""
                    );
                  }}
                />
                <FormTextField
                  fullWidth
                  placeholder="Ingrese número de Whatsapp"
                  value={values.billing.invoiceWhatsappNumber}
                  onChange={(e) => setBillingValue("invoiceWhatsappNumber", e.target.value)}
                  disabled={!sendInvoiceByWhatsapp}
                  inputProps={{ maxLength: 10 }}
                />
              </Box>

              <Button fullWidth variant="contained" onClick={handleSave}>
                Guardar cliente
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </SideModal>
  );
}
