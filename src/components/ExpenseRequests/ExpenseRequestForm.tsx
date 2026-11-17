import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import numeral from "numeral";
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
  getMyExpenseRequestContext,
  rejectExpenseRequest,
  reviewExpenseVoucher,
  sendToAuthorizeExpenseRequest,
  updateExpenseRequest,
} from "@/services/expense-requests.service";
import {
  addPettyCashVoucher,
  authorizePettyCashRequest,
  concludePettyCashRequest,
  createPettyCashRequest,
  deletePettyCashVoucher,
  getPettyCashOverview,
  rejectPettyCashRequest,
  reviewPettyCashVoucher,
  sendToAuthorizePettyCashRequest,
  updatePettyCashRequest,
} from "@/services/petty-cash.service";
import type {
  CompleteExpenseVerificationPayload,
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
  initialBranchId?: string | number;
  mode?: "expense" | "petty-cash";
  onSuccess?: (request: ExpenseRequestDetail) => void;
}

export function ExpenseRequestForm({
  request,
  initialClassification = "VIATICOS",
  initialBranchId,
  mode = "expense",
  onSuccess,
}: ExpenseRequestFormProps) {
  const isPettyCashMode = mode === "petty-cash";
  const baseRoute = isPettyCashMode
    ? "/facturas/cajas-chicas"
    : "/facturas/solicitudes-gastos";
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const currentUser = useAuthStore((s) => s.user);

  const isEdit = Boolean(request);
  const [activeTab, setActiveTab] = useState<ExpenseFormTab>("details");
  const [submitting, setSubmitting] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ExpenseRequestDetail | null>(
    request ?? null,
  );

  // Reject Request Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestRejectionReason, setRequestRejectionReason] = useState("");

  // Authorize Request Modal state (choose STP vs Caja Chica)
  const [authorizeModalOpen, setAuthorizeModalOpen] = useState(false);
  const [fundingSource, setFundingSource] = useState<"STP" | "CAJA_CHICA">("CAJA_CHICA");
  const [branchPettyCashBalance, setBranchPettyCashBalance] = useState<number | null>(null);
  const [loadingPettyCash, setLoadingPettyCash] = useState(false);

  // Catalogs
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [debtors, setDebtors] = useState<DiverseDebtorListItem[]>([]);
  const [debtorsLoaded, setDebtorsLoaded] = useState(false);
  const [categories, setCategories] = useState<InternalPayableCategoryListItem[]>([]);
  const [userDiverseDebtorId, setUserDiverseDebtorId] = useState<number | null | undefined>(
    currentUser?.diverseDebtorId,
  );
  const [userDetailLoaded, setUserDetailLoaded] = useState(false);

  // Form details state
  const [formState, setFormState] = useState<ExpenseRequestDetailsFormState>({
    classification:
      request?.classification ??
      (isPettyCashMode ? "CAJA_CHICA" : initialClassification),
    internalPayableCategoryId: request?.category?.id ? String(request.category.id) : "",
    diverseDebtorId: request?.debtor?.id
      ? String(request.debtor.id)
      : currentUser?.diverseDebtorId
        ? String(currentUser.diverseDebtorId)
        : "",
    branchId: request?.branch?.id
      ? String(request.branch.id)
      : initialBranchId
        ? String(initialBranchId)
        : "",
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
      .catch(() => { });

    getDiverseDebtorsCatalog()
      .then((items) => {
        if (Array.isArray(items)) setDebtors(items);
      })
      .catch(() => { })
      .finally(() => setDebtorsLoaded(true));

    getInternalPayableCategories({ limit: 100 })
      .then((res) => {
        if (res.data?.rows) setCategories(res.data.rows);
      })
      .catch(() => { });
  }, []);

  // Load logged-in user's diverseDebtorId from expense-requests/my-context
  useEffect(() => {
    getMyExpenseRequestContext()
      .then((res) => {
        if (res.data) {
          setUserDiverseDebtorId(res.data.diverseDebtorId ?? null);
          if (res.data.debtor) {
            const myDebtor = res.data.debtor;
            setDebtors((prev) =>
              prev.some((d) => d.id === myDebtor.id)
                ? prev
                : [...prev, myDebtor],
            );
          }
          if (res.data.branches && res.data.branches.length > 0) {
            setBranches((prev) => (prev.length > 0 ? prev : res.data!.branches!));
          }
          if (res.data.categories && res.data.categories.length > 0) {
            setCategories((prev) =>
              prev.length > 0 ? prev : res.data!.categories!,
            );
          }
          if (!isEdit && res.data.diverseDebtorId) {
            setFormState((prev) => ({
              ...prev,
              diverseDebtorId: String(res.data!.diverseDebtorId),
              branchId:
                prev.branchId ||
                (res.data?.debtor?.branchId
                  ? String(res.data.debtor.branchId)
                  : prev.branchId),
            }));
          }
        }
      })
      .catch(() => { })
      .finally(() => setUserDetailLoaded(true));
  }, [isEdit]);

  // Pre-fill debtor if user is linked to debtor
  useEffect(() => {
    const resolvedDebtorId = userDiverseDebtorId ?? currentUser?.diverseDebtorId;
    if (!isEdit && resolvedDebtorId) {
      setFormState((prev) => ({
        ...prev,
        diverseDebtorId: String(resolvedDebtorId),
      }));
    }
  }, [userDiverseDebtorId, currentUser?.diverseDebtorId, isEdit]);

  // Options
  const branchOptions: SelectOption[] = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.id),
        label: b.name,
      })),
    [branches],
  );

  const debtorOptions: SelectOption[] = useMemo(() => {
    const opts = debtors.map((d) => {
      const full = `${d.firstName} ${d.paternalSurname}${d.maternalSurname ? " " + d.maternalSurname : ""
        }`.trim();
      return {
        value: String(d.id),
        label: `${d.employeeNumber} - ${full}`,
      };
    });
    if (
      currentRequest?.debtor &&
      !opts.some((o) => o.value === String(currentRequest.debtor!.id))
    ) {
      opts.push({
        value: String(currentRequest.debtor.id),
        label: `${currentRequest.debtor.employeeNumber} - ${currentRequest.debtor.fullName}`,
      });
    }
    return opts;
  }, [debtors, currentRequest?.debtor]);

  const resolvedUserDebtorId =
    userDiverseDebtorId ?? currentUser?.diverseDebtorId ?? null;

  const isSameDebtorAsUser = Boolean(
    currentRequest &&
    ((resolvedUserDebtorId != null &&
      currentRequest.debtor?.id != null &&
      Number(currentRequest.debtor.id) === Number(resolvedUserDebtorId)) ||
      (currentUser?.id != null &&
        currentRequest.applicant?.id != null &&
        Number(currentRequest.applicant.id) === Number(currentUser.id))),
  );

  const isAuthorizedRole = Boolean(
    currentUser?.role?.toLowerCase().includes("admin") ||
    currentUser?.roleName?.toLowerCase().includes("admin") ||
    currentUser?.role?.toLowerCase().includes("gerente") ||
    currentUser?.roleName?.toLowerCase().includes("gerente") ||
    currentUser?.permissions?.includes("expense_requests:authorize") ||
    currentUser?.permissions?.includes("expense_requests:update") ||
    currentUser?.permissions?.includes("facturas.cajas_chicas.update"),
  );

  const canReview = true;

  const isEditable =
    !currentRequest ||
    currentRequest.status === "DRAFT" ||
    currentRequest.status === "PENDING_APPROVAL";

  const canAuthorizeOrReject = Boolean(
    isEdit && currentRequest?.status === "PENDING_APPROVAL",
  );

  const hasAssignedDebtor = Boolean(formState.diverseDebtorId);
  const canCreateRequest = true;

  // Categories filtered by classification configuration
  const categoryOptions: SelectOption[] = useMemo(() => {
    return categories
      .filter((c) => {
        if (isPettyCashMode || formState.classification === "CAJA_CHICA") {
          return !c.configuration || c.configuration === "CAJA_CHICA_REVOLVENTE";
        }
        if (c.configuration === "CAJA_CHICA_REVOLVENTE") return false;
        if (!c.configuration) return true;
        return c.configuration === formState.classification;
      })
      .map((c) => ({
        value: String(c.id),
        label: `${c.code} - ${c.name}`,
      }));
  }, [categories, formState.classification, isPettyCashMode]);

  const handleFieldChange = <K extends keyof ExpenseRequestDetailsFormState>(
    field: K,
    value: ExpenseRequestDetailsFormState[K],
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "classification") {
        const selectedCat = categories.find(
          (c) => String(c.id) === prev.internalPayableCategoryId,
        );
        if (
          selectedCat &&
          selectedCat.configuration &&
          selectedCat.configuration !== value
        ) {
          next.internalPayableCategoryId = "";
        }
      }
      return next;
    });
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateDetails = (): boolean => {
    const errs: Partial<Record<keyof ExpenseRequestDetailsFormState, string>> = {};
    if (!formState.internalPayableCategoryId) {
      errs.internalPayableCategoryId = "La categoría es obligatoria";
    }
    if (!formState.branchId) {
      errs.branchId = "La sucursal es obligatoria";
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
          diverseDebtorId: formState.diverseDebtorId
            ? Number(formState.diverseDebtorId)
            : undefined,
          branchId: Number(formState.branchId),
          startDate: formState.startDate,
          endDate: formState.endDate,
          destination: formState.destination.trim() || undefined,
          requestedAmount: Number.parseFloat(formState.requestedAmount),
          description: formState.description.trim() || undefined,
        };
        const res = isPettyCashMode
          ? await updatePettyCashRequest(currentRequest.id, payload)
          : await updateExpenseRequest(currentRequest.id, payload);
        if (res.error || !res.data) {
          showError(res.error?.message ?? "Error al actualizar la solicitud");
          return;
        }
        showSuccess("Solicitud actualizada correctamente");
        setCurrentRequest(res.data);
        onSuccess?.(res.data);
      } else {
        const payload: CreateExpenseRequestPayload = {
          classification: isPettyCashMode ? "CAJA_CHICA" : formState.classification,
          internalPayableCategoryId: Number(formState.internalPayableCategoryId),
          diverseDebtorId: formState.diverseDebtorId
            ? Number(formState.diverseDebtorId)
            : undefined,
          branchId: Number(formState.branchId),
          startDate: formState.startDate,
          endDate: formState.endDate,
          destination: formState.destination.trim() || undefined,
          requestedAmount: Number.parseFloat(formState.requestedAmount),
          description: formState.description.trim() || undefined,
        };
        const res = isPettyCashMode
          ? await createPettyCashRequest(payload)
          : await createExpenseRequest(payload);
        if (res.error || !res.data) {
          showError(res.error?.message ?? "Error al registrar la solicitud");
          return;
        }
        showSuccess(
          isPettyCashMode
            ? "Solicitud de reembolso de caja chica registrada con éxito"
            : "Solicitud de gastos registrada con éxito",
        );
        setCurrentRequest(res.data);
        onSuccess?.(res.data);
        void router.push(`${baseRoute}/${res.data.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToAuthorize = async () => {
    if (!currentRequest) return;
    setSubmitting(true);
    try {
      const res = isPettyCashMode
        ? await sendToAuthorizePettyCashRequest(currentRequest.id)
        : await sendToAuthorizeExpenseRequest(currentRequest.id);
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

  const openAuthorizeModal = () => {
    if (isPettyCashMode) {
      void handleAuthorize("CAJA_CHICA");
      return;
    }
    setFundingSource(currentRequest?.branch?.id ? "CAJA_CHICA" : "STP");
    setAuthorizeModalOpen(true);
    if (currentRequest?.branch?.id) {
      setLoadingPettyCash(true);
      getPettyCashOverview()
        .then((res) => {
          const found = (res.data ?? []).find(
            (b) => b.branchId === currentRequest.branch?.id,
          );
          setBranchPettyCashBalance(found?.balance ?? 0);
        })
        .catch(() => setBranchPettyCashBalance(null))
        .finally(() => setLoadingPettyCash(false));
    } else {
      setBranchPettyCashBalance(null);
    }
  };

  const handleAuthorize = async (sourceOverride?: "STP" | "CAJA_CHICA") => {
    if (!currentRequest) return;
    const chosenSource = sourceOverride ?? fundingSource;
    setSubmitting(true);
    try {
      const res = isPettyCashMode
        ? await authorizePettyCashRequest(currentRequest.id)
        : await authorizeExpenseRequest(currentRequest.id, {
          fundingSource: chosenSource,
        });
      if (res.error || !res.data) {
        showError(res.error?.message ?? "No se pudo autorizar la solicitud");
        return;
      }
      showSuccess(
        chosenSource === "CAJA_CHICA"
          ? "Solicitud autorizada con retiro de Caja Chica"
          : "Solicitud autorizada para dispersión por STP",
      );
      setAuthorizeModalOpen(false);
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
      const res = isPettyCashMode
        ? await rejectPettyCashRequest(
          currentRequest.id,
          requestRejectionReason.trim(),
        )
        : await rejectExpenseRequest(currentRequest.id, {
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
    const res = isPettyCashMode
      ? await addPettyCashVoucher(currentRequest.id, payload)
      : await addExpenseVoucher(currentRequest.id, payload);
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
    const res = isPettyCashMode
      ? await reviewPettyCashVoucher(currentRequest.id, voucherId, {
        action,
        rejectionReason: reason,
      })
      : await reviewExpenseVoucher(currentRequest.id, voucherId, {
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
    const res = isPettyCashMode
      ? await deletePettyCashVoucher(currentRequest.id, voucherId)
      : await deleteExpenseVoucher(currentRequest.id, voucherId);
    if (res.error || !res.data) {
      showError(res.error?.message ?? "Error al eliminar comprobante");
      return;
    }
    showSuccess("Comprobante eliminado");
    setCurrentRequest(res.data);
    onSuccess?.(res.data);
  };

  const handleConclude = async (payload?: CompleteExpenseVerificationPayload) => {
    if (!currentRequest) return;
    const prevStatus = currentRequest.status;
    const res = isPettyCashMode
      ? await concludePettyCashRequest(currentRequest.id, payload)
      : await concludeExpenseRequest(currentRequest.id, payload);
    if (res.error || !res.data) {
      showError(res.error?.message ?? "Error al procesar la comprobación");
      return;
    }
    if (
      (prevStatus === "IN_COMPROBATION" || prevStatus === "APPROVED") &&
      res.data.status === "IN_VERIFICATION"
    ) {
      showSuccess(
        "Comprobación concluida y enviada a En verificación para revisión del responsable",
      );
    } else if (
      prevStatus === "IN_VERIFICATION" &&
      res.data.status === "IN_VERIFICATION_FINAL"
    ) {
      showSuccess("Solicitud enviada a En verificación final");
    } else if (res.data.reimbursementSchedule) {
      showSuccess(
        "Revisión completada y reembolso de viáticos programado para devolución",
      );
    } else {
      showSuccess("Comprobación verificada y concluida satisfactoriamente");
    }
    setCurrentRequest(res.data);
    onSuccess?.(res.data);
  };

  const breadcrumbItems = useMemo(
    () => [
      {
        label: isPettyCashMode ? "Cajas chicas" : "Solicitud de gastos",
        href: baseRoute,
      },
      {
        label: isEdit
          ? currentRequest?.folio || "Detalle de solicitud"
          : isPettyCashMode
            ? "Nueva solicitud de reembolso"
            : "Nueva solicitud",
      },
    ],
    [isEdit, currentRequest?.folio, isPettyCashMode, baseRoute],
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
        onBack={() => router.push(baseRoute)}
      />

      <PageHeaderRow>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h2">
            {isEdit
              ? currentRequest?.folio || "Detalle de solicitud"
              : isPettyCashMode
                ? "Registrar solicitud de reembolso (Caja chica)"
                : "Registrar solicitud de gastos"}
          </Typography>
        </Stack>

        <HeaderActions>
          {isEditable && (
            <SaveButton
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={handleSave}
              disabled={submitting || (!isEdit && userDetailLoaded && debtorsLoaded && !canCreateRequest)}
            >
              {submitting ? (
                <CircularProgress size={20} />
              ) : isEdit ? (
                "Guardar cambios"
              ) : (
                "Registrar solicitud"
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

          {canAuthorizeOrReject && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle size={16} />}
                onClick={openAuthorizeModal}
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
                branchOptions={branchOptions}
                errors={formErrors}
                onChange={handleFieldChange}
                disabled={!isEditable}
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
                  canReview &&
                  (currentRequest.status === "IN_VERIFICATION" ||
                    currentRequest.status === "IN_VERIFICATION_FINAL" ||
                    currentRequest.status === "IN_COMPROBATION" ||
                    currentRequest.status === "APPROVED")
                }
              />
            )}

            {activeTab === "conclusion" && currentRequest && (
              <ExpenseRequestConclusionTab
                request={currentRequest}
                onConclude={handleConclude}
                canReviewAndComplete={canReview}
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

      {/* Authorize Request Dialog (STP vs Caja Chica) */}
      <Dialog
        open={authorizeModalOpen}
        onClose={() => !submitting && setAuthorizeModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Autorizar solicitud de gasto</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Define de dónde saldrá el dinero para esta solicitud de{" "}
              <strong>
                {numeral(currentRequest?.requestedAmount ?? 0).format("$0,0.00")}
              </strong>
              :
            </Typography>
            <RadioGroup
              value={fundingSource}
              onChange={(e) =>
                setFundingSource(e.target.value as "STP" | "CAJA_CHICA")
              }
            >
              <FormControlLabel
                value="STP"
                control={<Radio />}
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      Dispersar por STP
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Se enviará a Programación de pagos para dispersión bancaria.
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                value="CAJA_CHICA"
                control={<Radio />}
                disabled={!currentRequest?.branch?.id}
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      Saldrá de Caja Chica
                      {currentRequest?.branch?.name
                        ? ` (${currentRequest.branch.name})`
                        : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {!currentRequest?.branch?.id
                        ? "La solicitud no tiene sucursal asignada."
                        : loadingPettyCash
                          ? "Consultando saldo disponible..."
                          : `Saldo disponible: ${numeral(branchPettyCashBalance ?? 0).format("$0,0.00")}. Se descontará directamente de caja chica.`}
                    </Typography>
                  </Stack>
                }
              />
            </RadioGroup>

            {fundingSource === "CAJA_CHICA" &&
              branchPettyCashBalance !== null &&
              (currentRequest?.requestedAmount ?? 0) > branchPettyCashBalance && (
                <Alert severity="error">
                  Saldo insuficiente en caja chica para cubrir el monto solicitado.
                </Alert>
              )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAuthorizeModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={
              submitting ||
              (fundingSource === "CAJA_CHICA" &&
                (!currentRequest?.branch?.id ||
                  loadingPettyCash ||
                  (branchPettyCashBalance !== null &&
                    (currentRequest?.requestedAmount ?? 0) >
                    branchPettyCashBalance)))
            }
            onClick={() => handleAuthorize()}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirmar autorización"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
