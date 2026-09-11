import { useCallback, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown, CircleDotDashed } from "lucide-react";
import { SideModal, TabFilters } from "@/components";
import {
  getServiceOrderById,
  updateServiceOrder,
  updateServiceOrderStatus,
} from "@/services/service-orders.service";
import { usePermissions } from "@/hooks/usePermissions";
import { canUpdateCustomerSupportRepair } from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  InvoiceDetail,
  ServiceOrder,
  ServiceOrderAction,
  ServiceOrderIndicaciones,
  ServiceOrderQueja,
  ServiceOrderSolucion,
  ServiceOrderStatus,
} from "@/types/atencion-cliente.types";
import {
  indicacionesPatchForAction,
  paymentTypeLabel,
} from "@/types/atencion-cliente.types";
import { formatDateOnly } from "@/utils/date";
import {
  SERVICE_ORDER_STATUS_LABELS,
  SERVICE_ORDER_STATUSES,
  SERVICE_ORDER_TABS,
} from "./constants";
import { ServiceOrderQuejaTab } from "./ServiceOrderQuejaTab";
import { ServiceOrderIndicacionesTab } from "./ServiceOrderIndicacionesTab";
import { ServiceOrderSolucionTab } from "./ServiceOrderSolucionTab";
import { theme } from "@/styles/theme";

export type ServiceOrderDetailTab = "queja" | "indicaciones" | "solucion";

export interface ServiceOrderDetailModalProps {
  open: boolean;
  serviceOrderId: string | null;
  invoice: InvoiceDetail;
  onClose: () => void;
  onSuccess?: () => void;
  onRequestCancelInvoice?: () => void;
  /** Tab to open when the order loads. Defaults to "queja". */
  initialTab?: ServiceOrderDetailTab;
  /** Prefills Indicaciones action in local draft (not persisted until save). */
  initialIndicacionesAction?: ServiceOrderAction;
}

export function ServiceOrderDetailModal({
  open,
  serviceOrderId,
  invoice,
  onClose,
  onSuccess,
  onRequestCancelInvoice,
  initialTab = "queja",
  initialIndicacionesAction,
}: ServiceOrderDetailModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);
  const { hasPermission } = usePermissions();
  const canUpdate = canUpdateCustomerSupportRepair(hasPermission);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [draft, setDraft] = useState<ServiceOrder | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] =
    useState<null | HTMLElement>(null);

  const loadOrder = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const order = await getServiceOrderById(id);
      if (!order) {
        setDraft(null);
        showError("No se pudo cargar la orden de servicio.");
        return;
      }

      let next: ServiceOrder = order;
      if (initialIndicacionesAction) {
        next = {
          ...order,
          indicaciones: {
            ...order.indicaciones,
            ...indicacionesPatchForAction(
              initialIndicacionesAction,
              order.indicaciones,
            ),
          },
        };
      }
      setDraft(next);
      setActiveTab(initialTab);
    } catch (error) {
      console.error("[ServiceOrderDetailModal] Error loading order:", error);
      showError("No se pudo cargar la orden de servicio.");
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, [initialIndicacionesAction, initialTab, showError]);

  useEffect(() => {
    if (open && serviceOrderId) {
      void loadOrder(serviceOrderId);
    }
    if (!open) {
      setDraft(null);
      setStatusMenuAnchor(null);
    }
  }, [open, serviceOrderId, loadOrder]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const patchQueja = (patch: Partial<ServiceOrderQueja>) => {
    setDraft((prev) =>
      prev ? { ...prev, queja: { ...prev.queja, ...patch } } : prev,
    );
  };

  const patchIndicaciones = (patch: Partial<ServiceOrderIndicaciones>) => {
    setDraft((prev) =>
      prev
        ? { ...prev, indicaciones: { ...prev.indicaciones, ...patch } }
        : prev,
    );
  };

  const patchSolucion = (patch: Partial<ServiceOrderSolucion>) => {
    setDraft((prev) =>
      prev ? { ...prev, solucion: { ...prev.solucion, ...patch } } : prev,
    );
  };

  const handleStatusChange = async (status: ServiceOrderStatus) => {
    if (!draft) return;
    setStatusMenuAnchor(null);
    setDraft((prev) => (prev ? { ...prev, status } : prev));
    try {
      await updateServiceOrderStatus(draft.id, status);
    } catch (error) {
      console.error("[ServiceOrderDetailModal] Error updating status:", error);
      showError("No se pudo actualizar el estado.");
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.queja.complaint.trim()) {
      showError("La queja es obligatoria.");
      setActiveTab("queja");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateServiceOrder(draft.id, {
        title: draft.title,
        status: draft.status,
        queja: draft.queja,
        indicaciones: draft.indicaciones,
        solucion: draft.solucion,
      });
      setDraft(updated);

      if (updated.solucion.isSolved || updated.status === "finalizada") {
        showSuccess("Orden de servicio cerrada");
      } else {
        showSuccess("Orden de servicio actualizada");
      }
      onSuccess?.();
    } catch (error) {
      console.error("[ServiceOrderDetailModal] Error saving order:", error);
      showError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const paymentTypeLabelText = paymentTypeLabel(
    draft?.paymentType ?? invoice.paymentType,
  );

  const purchaseDateLabel = draft
    ? formatDateOnly(draft.purchaseDate, "dateLong")
    : "";
  const generatedAtLabel = draft
    ? formatDateOnly(draft.generatedAt, "dateLong")
    : "";

  const customHeader = (
    <>
      {draft && (
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: "12px", alignSelf: "center" }}
              />
            }
          >
            <Typography variant="body1" color="primary">
              Factura: {draft.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {purchaseDateLabel}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CircleDotDashed size={16} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                {paymentTypeLabelText}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack flex={1}>
              <Typography variant="body2" color="text.secondary">
                Cliente
              </Typography>
              <Typography variant="body1">{draft.customerName}</Typography>
            </Stack>
            <Stack flex={1}>
              <Typography variant="body2" color="text.secondary">
                Teléfono
              </Typography>
              <Typography variant="body1">{draft.customerPhone}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack flex={1}>
              <Typography variant="body2" color="text.secondary">
                Dirección
              </Typography>
              <Typography variant="body1">{draft.customerAddress}</Typography>
            </Stack>
            <Stack flex={1}>
              <Typography variant="body2" color="text.secondary">
                Generada por:
              </Typography>
              <Typography variant="body1">
                {draft.generatedBy} el {generatedAtLabel}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      )}
    </>
  );

  return (
    <>
      <SideModal
        open={open}
        onClose={handleClose}
        disableClose={saving}
        maxWidth="md"
        headerActionsPosition="top"
        headerActions={
          <>
            {draft && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="option"
                  color="inherit"
                  onClick={(event) => setStatusMenuAnchor(event.currentTarget)}
                  disabled={saving || !canUpdate}
                  endIcon={<ChevronDown size={16} />}
                  sx={{ textTransform: "none", whiteSpace: "nowrap" }}>
                  {SERVICE_ORDER_STATUS_LABELS[draft.status]}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving || loading || !canUpdate}>
                  {(saving) ? <CircularProgress size={16} color="inherit" /> : "Guardar cambios"}
                </Button>
              </Stack>
            )}
          </>
        }
        header={customHeader}
        contentSx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {
          (loading || !draft) ?
            <Stack alignItems="center" justifyContent="center" py={6}>
              <CircularProgress size={32} />
            </Stack>
            :
            <Stack spacing={2}>
              <TabFilters
                tabs={SERVICE_ORDER_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                disabled={saving}
              />

              {
                activeTab === "queja" &&
                <ServiceOrderQuejaTab
                  queja={draft.queja}
                  articles={invoice.articles}
                  disabled={saving}
                  onChange={patchQueja}
                />
              }
              {
                activeTab === "indicaciones" &&
                <ServiceOrderIndicacionesTab
                  indicaciones={draft.indicaciones}
                  customerAddress={draft.customerAddress}
                  disabled={saving}
                  onChange={patchIndicaciones}
                />
              }
              {
                activeTab === "solucion" &&
                <ServiceOrderSolucionTab
                  solucion={draft.solucion}
                  action={draft.indicaciones.action}
                  recoveryReceiver={draft.indicaciones.recoveryReceiver}
                  orderStatus={draft.status}
                  currentArticleId={draft.queja.articleId}
                  articles={invoice.articles}
                  disabled={saving}
                  onChange={patchSolucion}
                  onGoToCancelInvoice={() => {
                    onClose();
                    onRequestCancelInvoice?.();
                  }}
                />
              }
            </Stack>
        }
      </SideModal >

      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}>
        {
          SERVICE_ORDER_STATUSES.map((status) => (
            <MenuItem
              key={status}
              selected={draft?.status === status}
              onClick={() => void handleStatusChange(status)}>
              {SERVICE_ORDER_STATUS_LABELS[status]}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
}

const ServiceOrderDetailModalPage = () => null;

export default ServiceOrderDetailModalPage;
