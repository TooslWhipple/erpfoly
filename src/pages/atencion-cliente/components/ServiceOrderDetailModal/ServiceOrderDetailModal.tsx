import { useCallback, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  Check,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Wrench,
} from "lucide-react";
import { SideModal, StatusChip, TabFilters } from "@/components";
import {
  getServiceOrderById,
  updateServiceOrder,
  updateServiceOrderStatus,
} from "@/services/service-orders.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  InvoiceDetail,
  ServiceOrder,
  ServiceOrderIndicaciones,
  ServiceOrderQueja,
  ServiceOrderSolucion,
  ServiceOrderStatus,
} from "@/types/atencion-cliente.types";
import {
  DetailHeaderActions,
  GeneratedByText,
  InfoField,
  InfoGrid,
  InfoLabel,
  InfoValue,
  ModalInvoiceLink,
  ModalMetaRow,
  ServiceOrderBadge,
  ServiceOrderTitle,
  StatusMenuButton,
} from "@/styles/atencion-cliente.styles";
import {
  SERVICE_ORDER_STATUS_LABELS,
  SERVICE_ORDER_STATUS_VARIANTS,
  SERVICE_ORDER_STATUSES,
  SERVICE_ORDER_TABS,
} from "./constants";
import { ServiceOrderQuejaTab } from "./ServiceOrderQuejaTab";
import { ServiceOrderIndicacionesTab } from "./ServiceOrderIndicacionesTab";
import { ServiceOrderSolucionTab } from "./ServiceOrderSolucionTab";

export interface ServiceOrderDetailModalProps {
  open: boolean;
  serviceOrderId: string | null;
  invoice: InvoiceDetail;
  onClose: () => void;
  onSuccess?: () => void;
  onRequestCancelInvoice?: () => void;
}

function statusStartIcon(status: ServiceOrderStatus) {
  if (status === "finalizada") return <Check size={14} />;
  if (status === "listo_para_entregar") return <Check size={14} />;
  return <Clock size={14} />;
}

export function ServiceOrderDetailModal({
  open,
  serviceOrderId,
  invoice,
  onClose,
  onSuccess,
  onRequestCancelInvoice,
}: ServiceOrderDetailModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("queja");
  const [draft, setDraft] = useState<ServiceOrder | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] =
    useState<null | HTMLElement>(null);

  const loadOrder = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const order = await getServiceOrderById(id);
      setDraft(order);
      setActiveTab("queja");
    } catch (error) {
      console.error("[ServiceOrderDetailModal] Error loading order:", error);
      showError("No se pudo cargar la orden de servicio.");
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, [showError]);

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

  const handleDownload = () => {
    showSuccess("La descarga estará disponible próximamente.");
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

  const paymentTypeLabel =
    (draft?.paymentType ?? invoice.paymentType) === "credito"
      ? "Crédito"
      : "Contado";

  const customHeader = (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <DetailHeaderActions sx={{ width: "100%" }}>
        {draft && (
          <>
            <StatusMenuButton
              onClick={(event) => setStatusMenuAnchor(event.currentTarget)}
              disabled={saving}
              endIcon={<ChevronDown size={14} />}
            >
              <StatusChip
                label={SERVICE_ORDER_STATUS_LABELS[draft.status]}
                variant={SERVICE_ORDER_STATUS_VARIANTS[draft.status]}
                size="small"
                startIcon={statusStartIcon(draft.status)}
              />
            </StatusMenuButton>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleDownload}
              disabled={saving}
              startIcon={<Download size={16} />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Descargar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving || loading}
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Guardar cambios
            </Button>
          </>
        )}
      </DetailHeaderActions>

      {draft ? (
        <Stack spacing={1.5} sx={{ width: "100%" }}>
          <ServiceOrderBadge>
            <FileText size={14} />
            Órden de servicio
          </ServiceOrderBadge>
          <ServiceOrderTitle>{draft.title}</ServiceOrderTitle>
          <ModalMetaRow>
            <ModalInvoiceLink>
              Factura: {draft.invoiceNumber}
            </ModalInvoiceLink>
            <Typography variant="body2" color="text.secondary">
              {draft.purchaseDate}
            </Typography>
            <StatusChip
              label={paymentTypeLabel}
              variant="info"
              size="small"
              startIcon={<Wrench size={12} />}
            />
          </ModalMetaRow>
          <InfoGrid>
            <InfoField>
              <InfoLabel>Cliente</InfoLabel>
              <InfoValue>{draft.customerName}</InfoValue>
            </InfoField>
            <InfoField>
              <InfoLabel>Teléfono</InfoLabel>
              <InfoValue>{draft.customerPhone}</InfoValue>
            </InfoField>
          </InfoGrid>
          <InfoField>
            <InfoLabel>Dirección</InfoLabel>
            <InfoValue>{draft.customerAddress}</InfoValue>
          </InfoField>
          <GeneratedByText>
            Generada por: {draft.generatedBy} el {draft.generatedAt}
          </GeneratedByText>
        </Stack>
      ) : (
        <Typography variant="h6">Órden de servicio</Typography>
      )}
    </Stack>
  );

  return (
    <>
      <SideModal
        open={open}
        onClose={handleClose}
        disableClose={saving}
        maxWidth="lg"
        header={customHeader}
        contentSx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        {loading || !draft ? (
          <Stack alignItems="center" justifyContent="center" py={6}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <Stack
            spacing={2.5}
            sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}
          >
            <TabFilters
              tabs={SERVICE_ORDER_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              disabled={saving}
            />

            {activeTab === "queja" && (
              <ServiceOrderQuejaTab
                queja={draft.queja}
                articles={invoice.articles}
                disabled={saving}
                onChange={patchQueja}
              />
            )}
            {activeTab === "indicaciones" && (
              <ServiceOrderIndicacionesTab
                indicaciones={draft.indicaciones}
                customerAddress={draft.customerAddress}
                disabled={saving}
                onChange={patchIndicaciones}
              />
            )}
            {activeTab === "solucion" && (
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
            )}
          </Stack>
        )}
      </SideModal>

      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {SERVICE_ORDER_STATUSES.map((status) => (
          <MenuItem
            key={status}
            selected={draft?.status === status}
            onClick={() => void handleStatusChange(status)}
          >
            {SERVICE_ORDER_STATUS_LABELS[status]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const ServiceOrderDetailModalPage = () => null;

export default ServiceOrderDetailModalPage;
