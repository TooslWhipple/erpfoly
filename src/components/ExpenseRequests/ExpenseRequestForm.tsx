import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Save,
  Send,
  XCircle,
} from "lucide-react";
import { Breadcrumbs, TabFilters } from "@/components";
import type { SelectOption } from "@/components/Form";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUsersSelect, userSelectLabel } from "@/hooks/users/useUsersSelect";
import { getBranches, type BranchItem } from "@/services/users.service";
import {
  getDiverseDebtorsCatalog,
  type DiverseDebtorListItem,
} from "@/services/diverse-debtors.service";
import {
  getInternalPayableCategories,
} from "@/services/internal-payable-categories.service";
import type {
  InternalPayableCategoryListItem,
} from "@/types/internal-payable-categories.types";
import {
  addExpenseVoucher,
  authorizeExpenseRequest,
  concludeExpenseRequest,
  createExpenseRequest,
  deleteExpenseVoucher,
  rejectExpenseRequest,
  reviewExpenseVoucher,
  sendToAuthorizeExpenseRequest,
  updateExpenseRequest,
} from "@/services/expense-requests.service";
import type {
  CreateExpenseRequestPayload,
  CreateExpenseVoucherPayload,
  ExpenseRequestClassification,
  ExpenseRequestDetail,
  UpdateExpenseRequestPayload,
} from "@/types/expense-requests.types";
import {
  ContentLayout,
  FormCard,
  HeaderActions,
  MainPanel,
  PageContainer,
  PageHeaderRow,
  SaveButton,
  TabsSection,
} from "@/styles/facturas/registerExpense.styles";
import { ExpenseRequestDetailsTab, type ExpenseRequestDetailsFormState } from "./ExpenseRequestDetailsTab";
import { ExpenseRequestVouchersTab } from "./ExpenseRequestVouchersTab";
import { ExpenseRequestConclusionTab } from "./ExpenseRequestConclusionTab";
import { ExpenseRequestSummaryPanel } from "./ExpenseRequestSummaryPanel";

export type ExpenseFormTab = "details" | "vouchers" | "conclusion";

export interface ExpenseRequestFormProps {
  request?: ExpenseRequestDetail | null;
  initialClassification?: ExpenseRequestClassification;
  onSuccess?: (request: ExpenseRequestDetail) => void;
}

export function ExpenseRequestForm({
  request,
  initialClassification = "VIATICOS",
  onSuccess,
}: ExpenseRequestFormProps) {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const currentUser = useAuthStore((s) => s.user);

  const isEdit = Boolean(request);
  const isDraft = !request || request.status === "DRAFT";
  const [activeTab, setActiveTab] = useState<ExpenseFormTab>("details");
  const [submitting, setSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ExpenseRequestDetail | null>(
    request ?? null,
  );

  // Reject Request Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestRejectionReason, setRequestRejectionReason] = useState("");

  // Catalogs
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [debtors, setDebtors] = useState<DiverseDebtorListItem[]>([]);
  const [categories, setCategories] = useState<InternalPayableCategoryListItem[]>([]);
  const { data: users = [] } = useUsersSelect();

  // Form details state
  const [formState, setFormState] = useState<ExpenseRequestDetailsFormState>({
    classification: request?.classification ?? initialClassification,
    internalPayableCategoryId: request?.category?.id ? String(request.category.id) : "",
    diverseDebtorId: request?.debtor?.id ? String(request.debtor.id) : "",
    responsibleUserId: request?.responsible?.id ? String(request.responsible.id) : "",
    branchId: request?.branch?.id ? String(request.branch.id) : "",
    startDate: request?.startDate ?? new Date().toISOString().split("T")[0],
    endDate: request?.endDate ?? new Date().toISOString().split("T")[0],
    destination: request?.destination ?? "",
    requestedAmount: request ? String(request.requestedAmount) : "",
    description: request?.description ?? "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ExpenseRequestDetailsFormState, string>>
  >({});

  // Sync when prop changes
  useEffect(() => {
    if (request) {
      setCurrentRequest(request);
      setFormState({
        classification: request.classification,
        internalPayableCategoryId: request.category?.id ? String(request.category.id) : "",
        diverseDebtorId: request.debtor?.id ? String(request.debtor.id) : "",
        responsibleUserId: request.responsible?.id ? String(request.responsible.id) : "",
        branchId: request.branch?.id ? String(request.branch.id) : "",
        startDate: request.startDate,
        endDate: request.endDate,
        destination: request.destination ?? "",
        requestedAmount: String(request.requestedAmount),
        description: request.description ?? "",
      });
    }
  }, [request]);

  // Load catalogs
  useEffect(() => {
    getBranches()
      .then((res) => {
        if (res.data) setBranches(res.data);
      })
      .catch(() => {});

    getDiverseDebtorsCatalog()
      .then((items) => {
        if (Array.isArray(items)) setDebtors(items);
      })
      .catch(() => {});

    getInternalPayableCategories({ limit: 100 })
      .then((res) => {
        if (res.data?.rows) setCategories(res.data.rows);
      })
      .catch(() => {});
  }, []);

  // Pre-fill debtor if user is linked to debtor
  useEffect(() => {
    if (!isEdit && !formState.diverseDebtorId && currentUser?.diverseDebtorId) {
      setFormState((prev) => ({
        ...prev,
        diverseDebtorId: String(currentUser.diverseDebtorId),
      }));
    }
  }, [currentUser, isEdit, formState.diverseDebtorId]);

  // Options
  const branchOptions: SelectOption[] = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.id),
        label: b.name,
      })),
    [branches],
  );

  const debtorOptions: SelectOption[] = useMemo(
    () =>
      debtors.map((d) => {
        const full = `${d.firstName} ${d.paternalSurname}${
          d.maternalSurname ? " " + d.maternalSurname : ""
        }`.trim();
        return {
          value: String(d.id),
          label: `${d.employeeNumber} - ${full}`,
        };
      }),
    [debtors],
  );

  // When debtor selected, get potential responsibles
  const selectedDebtor = useMemo(
    () => debtors.find((d) => String(d.id) === formState.diverseDebtorId),
    [debtors, formState.diverseDebtorId],
  );

  const responsibleOptions: SelectOption[] = useMemo(() => {
    if (selectedDebtor?.responsibles && selectedDebtor.responsibles.length > 0) {
      return selectedDebtor.responsibles.map((r) => ({
        value: String(r.userId),
        label: `${r.fullName || r.username} (Responsable Asignado)`,
      }));
    }
    return users.map((u) => ({
      value: String(u.id),
      label: userSelectLabel(u),
    }));
  }, [selectedDebtor, users]);

  // Categories filtered by classification configuration
  const categoryOptions: SelectOption[] = useMemo(() => {
    return categories
      .filter((c) => {
        if (!c.configuration) return true;
        return c.configuration === formState.classification;
      })
      .map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
      }));
  }, [categories, formState.classification]);

  const handleFieldChange = <K extends keyof ExpenseRequestDetailsFormState>(
    field: K,
    value: ExpenseRequestDetailsFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateDetails = (): boolean => {
    const errs: Partial<Record<keyof ExpenseRequestDetailsFormState, string>> = {};
    if (!formState.internalPayableCategoryId) {
      errs.internalPayableCategoryId = "La categoría es obligatoria";
    }
    if (!formState.diverseDebtorId) {
      errs.diverseDebtorId = "El empleado / deudor es obligatorio";
    }
    if (!formState.branchId) {
      errs.branchId = "La sucursal es obligatoria";
    }
    if (!formState.responsibleUserId) {
      errs.responsibleUserId = "El responsable de autorización es obligatorio";
    }
    if (!formState.startDate) {
      errs.startDate = "La fecha de inicio es obligatoria";
    }
    if (!formState.endDate) {
      errs.endDate = "La fecha de fin es obligatoria";
    }
    if (formState.classification === "VIATICOS" && !formState.destination.trim()) {
      errs.destination = "El destino es obligatorio para viáticos";
    }
    const amt = Number.parseFloat(formState.requestedAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      errs.requestedAmount = "Ingresa un monto válido mayor a 0";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateDetails()) {
      showError("Por favor completa los campos requeridos");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && currentRequest) {
        const payload: UpdateExpenseRequestPayload = {
          internalPayableCategoryId: Number(formState.internalPayableCategoryId),
          diverseDebtorId: Number(formState.diverseDebtorId),
          branchId: Number(formState.branchId),
          responsibleUserId: Number(formState.responsibleUserId),
          startDate: formState.startDate,
          endDate: formState.endDate,
          destination: formState.destination.trim() || undefined,
          requestedAmount: Number.parseFloat(formState.requestedAmount),
          description: formState.description.trim() || undefined,
        };
        const res = await updateExpenseRequest(currentRequest.id, payload);
        if (res.error || !res.data) {
          showError(res.error?.message ?? "Error al actualizar la solicitud");
          return;
        }
        showSuccess("Solicitud actualizada correctamente");
        setCurrentRequest(res.data);
        onSuccess?.(res.data);
      } else {
        const payload: CreateExpenseRequestPayload = {
          classification: formState.classification,
          internalPayableCategoryId: Number(formState.internalPayableCategoryId),
          diverseDebtorId: Number(formState.diverseDebtorId),
          branchId: Number(formState.branchId),
          responsibleUserId: Number(formState.responsibleUserId),
          startDate: formState.startDate,
          endDate: formState.endDate,
          destination: formState.destination.trim() || undefined,
          requestedAmount: Number.parseFloat(formState.requestedAmount),
          description: formState.description.trim() || undefined,
        };
        const res = await createExpenseRequest(payload);
        if (res.error || !res.data) {
          showError(res.error?.message ?? "Error al registrar la solicitud");
          return;
        }
        showSuccess("Solicitud de gastos registrada con éxito");
        setCurrentRequest(res.data);
        onSuccess?.(res.data);
        void router.push(`/facturas/solicitudes-gastos/${res.data.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToAuthorize = async () => {
    if (!currentRequest) return;
    setSubmitting(true);
    try {
      const res = await sendToAuthorizeExpenseRequest(currentRequest.id);
      if (res.error || !res.data) {
        showError(res.error?.message ?? "No se pudo enviar a autorizar");
        return;
      }
      showSuccess("Solicitud enviada a autorización");
      setCurrentRequest(res.data);
      onSuccess?.(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthorize = async () => {
    if (!currentRequest) return;
    setSubmitting(true);
    try {
      const res = await authorizeExpenseRequest(currentRequest.id);
      if (res.error || !res.data) {
        showError(res.error?.message ?? "No se pudo autorizar la solicitud");
        return;
      }
      showSuccess("Solicitud autorizada con éxito");
      setCurrentRequest(res.data);
      onSuccess?.(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!currentRequest || !requestRejectionReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await rejectExpenseRequest(currentRequest.id, {
        rejectionReason: requestRejectionReason.trim(),
      });
      if (res.error || !res.data) {
        showError(res.error?.message ?? "No se pudo rechazar la solicitud");
        return;
      }
      showSuccess("Solicitud rechazada");
      setRejectModalOpen(false);
      setRequestRejectionReason("");
      setCurrentRequest(res.data);
      onSuccess?.(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  // Voucher operations
  const handleAddVoucher = async (payload: CreateExpenseVoucherPayload) => {
    if (!currentRequest) return;
    const res = await addExpenseVoucher(currentRequest.id, payload);
    if (res.error || !res.data) {
      showError(res.error?.message ?? "Error al subir comprobante");
      return;
    }
    showSuccess("Comprobante agregado");
    setCurrentRequest(res.data);
    onSuccess?.(res.data);
  };

  const handleReviewVoucher = async (
    voucherId: number,
    action: "ACCEPT" | "REJECT",
    reason?: string,
  ) => {
    if (!currentRequest) return;
    const res = await reviewExpenseVoucher(currentRequest.id, voucherId, {
      action,
      rejectionReason: reason,
    });
    if (res.error || !res.data) {
      showError(res.error?.message ?? "Error al evaluar comprobante");
      return;
    }
    showSuccess(
      action === "ACCEPT" ? "Comprobante aceptado" : "Comprobante rechazado",
    );
    setCurrentRequest(res.data);
    onSuccess?.(res.data);
  };

  const handleDeleteVoucher = async (voucherId: number) => {
    if (!currentRequest) return;
    const res = await deleteExpenseVoucher(currentRequest.id, voucherId);
    if (res.error || !res.data) {
      showError(res.error?.message ?? "Error al eliminar comprobante");
      return;
    }
    showSuccess("Comprobante eliminado");
    setCurrentRequest(res.data);
    onSuccess?.(res.data);
  };

  const handleConclude = async () => {
    if (!currentRequest) return;
    const res = await concludeExpenseRequest(currentRequest.id);
    if (res.error || !res.data) {
      showError(res.error?.message ?? "Error al concluir comprobación");
      return;
    }
    showSuccess("Comprobación concluida satisfactoriamente");
    setCurrentRequest(res.data);
    onSuccess?.(res.data);
  };

  const breadcrumbItems = useMemo(
    () => [
      {
        label: "Solicitud de gastos",
        href: "/facturas/solicitudes-gastos",
      },
      {
        label: isEdit
          ? currentRequest?.folio || "Detalle de solicitud"
          : "Nueva solicitud",
      },
    ],
    [isEdit, currentRequest?.folio],
  );

  const tabItems = [
    { value: "details", label: "Detalles" },
    {
      value: "vouchers",
      label: `Comprobantes (${currentRequest?.vouchers.length ?? 0})`,
      disabled: !currentRequest,
    },
    {
      value: "conclusion",
      label: "Liquidación y Conclusión",
      disabled: !currentRequest,
    },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={breadcrumbItems}
        showBackButton
        onBack={() => router.push("/facturas/solicitudes-gastos")}
      />

      <PageHeaderRow>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h2">
            {isEdit
              ? currentRequest?.folio || "Detalle de solicitud"
              : "Registrar solicitud de gastos"}
          </Typography>
        </Stack>

        <HeaderActions>
          {isDraft && (
            <SaveButton
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <CircularProgress size={20} />
              ) : isEdit ? (
                "Guardar cambios"
              ) : (
                "Guardar borrador"
              )}
            </SaveButton>
          )}

          {isEdit && currentRequest?.status === "DRAFT" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Send size={16} />}
              onClick={handleSendToAuthorize}
              disabled={submitting}
            >
              Enviar a autorizar
            </Button>
          )}

          {isEdit && currentRequest?.status === "PENDING_APPROVAL" && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle size={16} />}
                onClick={handleAuthorize}
                disabled={submitting}
              >
                Autorizar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={16} />}
                onClick={() => setRejectModalOpen(true)}
                disabled={submitting}
              >
                Rechazar
              </Button>
            </>
          )}
        </HeaderActions>
      </PageHeaderRow>

      <TabsSection>
        <TabFilters
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ExpenseFormTab)}
        />
      </TabsSection>

      <ContentLayout>
        <MainPanel>
          <FormCard>
            {activeTab === "details" && (
              <ExpenseRequestDetailsTab
                values={formState}
                categoryOptions={categoryOptions}
                debtorOptions={debtorOptions}
                responsibleOptions={responsibleOptions}
                branchOptions={branchOptions}
                errors={formErrors}
                onChange={handleFieldChange}
                disabled={!isDraft}
              />
            )}

            {activeTab === "vouchers" && currentRequest && (
              <ExpenseRequestVouchersTab
                requestStatus={currentRequest.status}
                vouchers={currentRequest.vouchers}
                onAddVoucher={handleAddVoucher}
                onReviewVoucher={handleReviewVoucher}
                onDeleteVoucher={handleDeleteVoucher}
                canAddVouchers={
                  currentRequest.status !== "COMPLETED" &&
                  currentRequest.status !== "CANCELLED" &&
                  currentRequest.status !== "REJECTED"
                }
                canReviewVouchers={
                  currentRequest.status === "APPROVED" ||
                  currentRequest.status === "IN_VERIFICATION"
                }
              />
            )}

            {activeTab === "conclusion" && currentRequest && (
              <ExpenseRequestConclusionTab
                request={currentRequest}
                onConclude={handleConclude}
              />
            )}
          </FormCard>
        </MainPanel>

        <ExpenseRequestSummaryPanel
          request={currentRequest}
          temporaryValues={{
            classification: formState.classification,
            requestedAmount: Number.parseFloat(formState.requestedAmount) || 0,
            destination: formState.destination,
            startDate: formState.startDate,
            endDate: formState.endDate,
          }}
        />
      </ContentLayout>

      {/* Reject Request Dialog */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => !submitting && setRejectModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Rechazar Solicitud de Gastos</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo"
            value={requestRejectionReason}
            onChange={(e) => setRequestRejectionReason(e.target.value)}
            placeholder="Especifica el motivo del rechazo..."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectRequest}
            disabled={submitting || !requestRejectionReason.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : "Confirmar Rechazo"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
