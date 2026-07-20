import { Checkbox, Stack, Switch, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FormAutocomplete,
  FormDatePicker,
  FormSelect,
  FormTextField,
  RadioButton,
} from "@/components";
import { FileUpload } from "@/components/FileUpload";
import type { UploadedFileItem } from "@/components/FileUpload";
import type { SelectOption } from "@/components/Form";
import { ROLE_CODES } from "@/constants/role-codes";
import { useUsersSelect } from "@/hooks/users/useUsersSelect";
import { getDamagedProductsCatalog } from "@/services/damaged-products.service";
import type {
  InvoiceArticle,
  ServiceOrderAction,
  ServiceOrderRecoveryReceiver,
  ServiceOrderSolucion,
  ServiceOrderStatus,
} from "@/types/atencion-cliente.types";
import { hasOtherUncancelledArticles } from "@/types/atencion-cliente.types";
import {
  AlertBox,
  AlertLinkButton,
  DamagedGoodsCard,
  RadioGroupResponsive,
  SectionLabel,
  SwitchRow,
} from "@/styles/atencion-cliente.styles";

export interface ServiceOrderSolucionTabProps {
  solucion: ServiceOrderSolucion;
  action: ServiceOrderAction;
  recoveryReceiver: ServiceOrderRecoveryReceiver;
  orderStatus: ServiceOrderStatus;
  currentArticleId: string;
  articles: InvoiceArticle[];
  disabled?: boolean;
  onChange: (patch: Partial<ServiceOrderSolucion>) => void;
  onGoToCancelInvoice?: () => void;
}

function catalogItemIdString(item: { id: string | number }): string {
  return String(item.id);
}

const DRIVER_ROLE_CODES_EXCLUDED = `${ROLE_CODES.CHOFER},${ROLE_CODES.AYUDANTE_CHOFER}`;

export function ServiceOrderSolucionTab({
  solucion,
  action,
  recoveryReceiver,
  orderStatus,
  currentArticleId,
  articles,
  disabled = false,
  onChange,
  onGoToCancelInvoice,
}: ServiceOrderSolucionTabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const catalogQuery = useQuery({
    queryKey: ["damaged-products-catalog", "service-order"],
    queryFn: async () => {
      const result = await getDamagedProductsCatalog();
      if (result.error != null) throw new Error(result.error.message);
      if (result.data == null) throw new Error("Catálogo vacío");
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const authorizersQuery = useUsersSelect({
    excludeRoleCodes: DRIVER_ROLE_CODES_EXCLUDED,
  });

  const damageTypeOptions: SelectOption[] = useMemo(
    () =>
      (catalogQuery.data?.damageTypes ?? []).map((item) => ({
        value: catalogItemIdString(item),
        label: item.label,
      })),
    [catalogQuery.data?.damageTypes],
  );

  const solutionOptions: SelectOption[] = useMemo(
    () =>
      (catalogQuery.data?.solutions ?? []).map((item) => ({
        value: catalogItemIdString(item),
        label: item.label,
      })),
    [catalogQuery.data?.solutions],
  );

  const authorizerOptions = authorizersQuery.selectOptions;

  const isCancelSale = action === "cancelar_venta";
  const needsOtherArticlesCancelled =
    isCancelSale && hasOtherUncancelledArticles(articles, currentArticleId);
  const canPromptInvoiceCancel = isCancelSale && !needsOtherArticlesCancelled;
  const showAuthorizedOnly =
    isCancelSale &&
    recoveryReceiver === "no_se_recoge" &&
    orderStatus === "finalizada";

  const acceptanceFiles: UploadedFileItem[] = solucion.acceptanceLetterUrl
    ? [
        {
          id: "acceptance-letter",
          name: "Carta de aceptación",
          url: solucion.acceptanceLetterUrl,
        },
      ]
    : [];

  if (isCancelSale) {
    return (
      <Stack spacing={2.5}>
        {needsOtherArticlesCancelled && (
          <AlertBox tone="warning">
            Deberás cancelar los demás artículos de la factura para proceder con
            una cancelación.
          </AlertBox>
        )}

        {canPromptInvoiceCancel && (
          <AlertBox tone="info">
            <Stack spacing={0.5} sx={{ width: "100%" }}>
              <Typography variant="body2">
                Puedes cancelar la factura desde el detalle de la factura
              </Typography>
              {onGoToCancelInvoice && (
                <AlertLinkButton
                  onClick={onGoToCancelInvoice}
                  endIcon={<ExternalLink size={14} />}
                  disabled={disabled}
                >
                  Ir a cancelar factura
                </AlertLinkButton>
              )}
            </Stack>
          </AlertBox>
        )}

        {(showAuthorizedOnly || !needsOtherArticlesCancelled) && (
          <FormAutocomplete
            label="Autorizado por"
            options={authorizerOptions}
            value={solucion.authorizedById}
            onChange={(value) => onChange({ authorizedById: value })}
            disabled={disabled || authorizersQuery.isPending}
            placeholder="Buscar usuario"
            noOptionsText={
              authorizersQuery.isError
                ? "No se pudieron cargar usuarios"
                : "Sin usuarios"
            }
          />
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <SwitchRow>
        <Typography variant="body2" fontWeight={500}>
          ¿Fue solucionada esta órden de servicio?
        </Typography>
        <Switch
          checked={solucion.isSolved}
          onChange={(_, checked) => onChange({ isSolved: checked })}
          disabled={disabled}
          color="primary"
        />
      </SwitchRow>

      {solucion.isSolved && (
        <>
          <FormDatePicker
            label="Fecha en que fue solucionado"
            value={solucion.solvedDate}
            onChange={(value) => onChange({ solvedDate: value })}
            disabled={disabled}
            placeholder="Selecciona una fecha"
          />

          <Stack spacing={1}>
            <SectionLabel>
              Medio por el cuál fue aprobada la solución por parte del cliente
            </SectionLabel>
            <RadioGroupResponsive>
              <RadioButton
                value="llamada"
                label="Llamada telefónica"
                checked={solucion.approvalMethod === "llamada"}
                onChange={() => onChange({ approvalMethod: "llamada" })}
                disabled={disabled}
                fullWidth={isMobile}
              />
              <RadioButton
                value="encuesta"
                label="Encuesta de satisfacción"
                checked={solucion.approvalMethod === "encuesta"}
                onChange={() => onChange({ approvalMethod: "encuesta" })}
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

          {solutionOptions.length > 0 && (
            <FormSelect
              label="Seleccione la solución entregada"
              options={solutionOptions}
              value={solucion.deliveredSolutionId}
              onChange={(event) =>
                onChange({ deliveredSolutionId: String(event.target.value) })
              }
              disabled={disabled || catalogQuery.isPending}
              placeholder="Seleccione"
            />
          )}

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Cargar carta de aceptación
            </Typography>
            <FileUpload
              value={acceptanceFiles}
              onChange={(files) => {
                const first = files[0];
                const url =
                  first?.url ??
                  (first?.file ? URL.createObjectURL(first.file) : "");
                onChange({ acceptanceLetterUrl: url });
              }}
              accept={["application/pdf", "image/*"]}
              placeholder="Cargar carta de aceptación"
              disabled={disabled}
            />
          </Stack>

          <FormAutocomplete
            label="Autorizado por"
            options={authorizerOptions}
            value={solucion.authorizedById}
            onChange={(value) => onChange({ authorizedById: value })}
            disabled={disabled || authorizersQuery.isPending}
            placeholder="Buscar usuario"
            noOptionsText={
              authorizersQuery.isError
                ? "No se pudieron cargar usuarios"
                : "Sin usuarios"
            }
          />
        </>
      )}

      <DamagedGoodsCard
        onClick={() => {
          if (disabled) return;
          onChange({
            registerAsDamagedGoods: !solucion.registerAsDamagedGoods,
          });
        }}
        role="checkbox"
        aria-checked={solucion.registerAsDamagedGoods}
      >
        <Checkbox
          checked={solucion.registerAsDamagedGoods}
          disabled={disabled}
          onChange={(_, checked) =>
            onChange({ registerAsDamagedGoods: checked })
          }
          onClick={(event) => event.stopPropagation()}
          color="primary"
        />
        <Typography variant="body2" fontWeight={500} sx={{ pt: 1.25 }}>
          Registrar como mercancía dañada
        </Typography>
      </DamagedGoodsCard>

      {solucion.registerAsDamagedGoods && (
        <>
          <FormSelect
            label="Tipo de daño"
            options={damageTypeOptions}
            value={solucion.damageTypeId}
            onChange={(event) =>
              onChange({ damageTypeId: String(event.target.value) })
            }
            disabled={disabled || catalogQuery.isPending}
            placeholder="Selecciona"
          />
          <FormTextField
            label="Observaciones"
            value={solucion.observations}
            onChange={(event) => onChange({ observations: event.target.value })}
            disabled={disabled}
            multiline
            minRows={3}
            placeholder="Ingrese"
          />
        </>
      )}
    </Stack>
  );
}

const ServiceOrderSolucionTabPage = () => null;

export default ServiceOrderSolucionTabPage;
