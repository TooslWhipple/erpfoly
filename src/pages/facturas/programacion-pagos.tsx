import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Banknote,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Moon,
  RefreshCw,
  Search,
  Send,
  Square,
  Wallet,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import numeral from "numeral";
import { Title, TabFilters } from "@/components";
import { FormDatePicker } from "@/components/Form";
import type { TabOption } from "@/components/TabFilters";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { formatDate } from "@/utils/date";
import {
  disperseExpenseRequests,
  getPaymentSchedule,
  instantDisperseScheduledPayment,
  rescheduleScheduledPayments,
  updateScheduledPaymentSelection,
} from "@/services/expense-requests.service";
import type {
  AvailableScheduleDate,
  ScheduledPaymentCategory,
  ScheduledPaymentItem,
} from "@/types/expense-requests.types";
import {
  SummaryCard,
  SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";

const CATEGORY_TABS: TabOption[] = [
  { label: "Todos", value: "ALL" },
  { label: "Viáticos", value: "VIATICOS" },
  { label: "Solicitud de Gastos", value: "SOLICITUD_GASTOS" },
  { label: "Reembolso de Viáticos", value: "REEMBOLSO_VIATICOS" },
  { label: "Proveedores", value: "PROVEEDOR" },
  { label: "Gastos Generales", value: "GASTO_GENERAL" },
  { label: "Caja Chica", value: "CAJA_CHICA" },
];

const CATEGORY_LABELS: Record<ScheduledPaymentCategory, string> = {
  PROVEEDOR: "Proveedor",
  GASTO_GENERAL: "Gasto General",
  VIATICOS: "Viáticos",
  SOLICITUD_GASTOS: "Solicitud de Gastos",
  CAJA_CHICA: "Caja Chica",
  REEMBOLSO_VIATICOS: "Reembolso Viáticos",
};

const CATEGORY_CHIP_COLORS: Record<
  ScheduledPaymentCategory,
  "primary" | "info" | "secondary" | "warning" | "success"
> = {
  PROVEEDOR: "primary",
  GASTO_GENERAL: "info",
  VIATICOS: "secondary",
  SOLICITUD_GASTOS: "warning",
  CAJA_CHICA: "success",
  REEMBOLSO_VIATICOS: "info",
};

function formatCurrency(val: number): string {
  return numeral(val).format("$0,0.00");
}

function getLocalDateIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function shiftIsoDate(isoDate: string, deltaDays: number): string {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return getLocalDateIso(0);
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + deltaDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ProgramacionPagosPage() {
  const router = useRouter();
  const muiTheme = useTheme();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const todayIso = useMemo(() => getLocalDateIso(0), []);
  const tomorrowIso = useMemo(() => getLocalDateIso(1), []);

  // Default to tomorrow because authorized Viáticos / Solicitudes de gastos are scheduled for the next day
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowIso);
  const [viewAllDates, setViewAllDates] = useState<boolean>(false);

  const [payments, setPayments] = useState<ScheduledPaymentItem[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableScheduleDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingBatch, setSubmittingBatch] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [lastConfirmedBatchCode, setLastConfirmedBatchCode] = useState<string | null>(
    null,
  );

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTargets, setRescheduleTargets] = useState<ScheduledPaymentItem[]>(
    [],
  );
  const [newScheduleDate, setNewScheduleDate] = useState<string>(tomorrowIso);
  const [rescheduling, setRescheduling] = useState(false);

  // Instant STP dispersion modal state
  const [instantStpTarget, setInstantStpTarget] =
    useState<ScheduledPaymentItem | null>(null);
  const [processingInstantStp, setProcessingInstantStp] = useState(false);
  const [lastStpResult, setLastStpResult] = useState<{
    folio: string;
    beneficiary: string;
    amount: number;
    paymentReference: string;
  } | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPaymentSchedule({
        ...(viewAllDates || !selectedDate ? {} : { scheduledDate: selectedDate }),
      });
      if (res.error) {
        showError(res.error.message || "Error al cargar la programación de pagos");
        return;
      }
      if (res.data) {
        setPayments(res.data.rows ?? []);
        setAvailableDates(res.data.availableDates ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewAllDates, showError]);

  useEffect(() => {
    void fetchSchedule();
  }, [fetchSchedule]);

  // Toggle single payment selection
  const handleTogglePayment = async (payment: ScheduledPaymentItem) => {
    if (payment.status === "PAGADO") return;
    const nextSelected = !payment.selectedForDispersion;

    setPayments((prev) =>
      prev.map((item) =>
        item.id === payment.id
          ? { ...item, selectedForDispersion: nextSelected }
          : item,
      ),
    );

    const res = await updateScheduledPaymentSelection(payment.id, {
      selectedForDispersion: nextSelected,
    });
    if (res.error) {
      showError(res.error.message || "No se pudo actualizar la selección");
      setPayments((prev) =>
        prev.map((item) =>
          item.id === payment.id
            ? { ...item, selectedForDispersion: !nextSelected }
            : item,
        ),
      );
    }
  };

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchCategory =
        activeTab === "ALL" || item.category === activeTab;
      const term = search.trim().toLowerCase();
      const matchSearch =
        !term ||
        item.folio.toLowerCase().includes(term) ||
        item.beneficiary.toLowerCase().includes(term) ||
        (item.beneficiaryRfc || "").toLowerCase().includes(term) ||
        item.concept.toLowerCase().includes(term) ||
        (item.bankName || "").toLowerCase().includes(term) ||
        (item.clabe || "").includes(term) ||
        (item.paymentReference || "").toLowerCase().includes(term) ||
        (item.branch?.name || "").toLowerCase().includes(term);

      return matchCategory && matchSearch;
    });
  }, [payments, activeTab, search]);

  const pendingFilteredPayments = useMemo(
    () => filteredPayments.filter((p) => p.status === "PENDIENTE"),
    [filteredPayments],
  );

  // Bulk actions
  const allFilteredSelected =
    pendingFilteredPayments.length > 0 &&
    pendingFilteredPayments.every((item) => item.selectedForDispersion);

  const someFilteredSelected =
    pendingFilteredPayments.some((item) => item.selectedForDispersion) &&
    !allFilteredSelected;

  const handleToggleAllFiltered = async () => {
    const targetState = !allFilteredSelected;
    const targetIds = new Set(pendingFilteredPayments.map((p) => p.id));

    setPayments((prev) =>
      prev.map((item) =>
        targetIds.has(item.id)
          ? { ...item, selectedForDispersion: targetState }
          : item,
      ),
    );

    await Promise.all(
      pendingFilteredPayments.map((p) =>
        updateScheduledPaymentSelection(p.id, {
          selectedForDispersion: targetState,
        }),
      ),
    );
  };

  const handleSelectAllPending = async (select: boolean) => {
    const pendingList = payments.filter((p) => p.status === "PENDIENTE");
    setPayments((prev) =>
      prev.map((item) =>
        item.status === "PENDIENTE"
          ? { ...item, selectedForDispersion: select }
          : item,
      ),
    );

    await Promise.all(
      pendingList.map((p) =>
        updateScheduledPaymentSelection(p.id, {
          selectedForDispersion: select,
        }),
      ),
    );
  };

  // Financial calculations
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "PENDIENTE"),
    [payments],
  );

  const totalPendingAmount = useMemo(
    () => pendingPayments.reduce((acc, cur) => acc + cur.amount, 0),
    [pendingPayments],
  );

  const selectedPendingPayments = useMemo(
    () => pendingPayments.filter((p) => p.selectedForDispersion),
    [pendingPayments],
  );

  const totalTonightToDisperse = useMemo(
    () => selectedPendingPayments.reduce((acc, cur) => acc + cur.amount, 0),
    [selectedPendingPayments],
  );

  const totalExcluded = useMemo(
    () => Math.max(0, totalPendingAmount - totalTonightToDisperse),
    [totalPendingAmount, totalTonightToDisperse],
  );

  const selectedCount = selectedPendingPayments.length;
  const totalPendingCount = pendingPayments.length;

  // Category counts for tabs
  const tabsWithCounts: TabOption[] = useMemo(() => {
    return CATEGORY_TABS.map((t) => ({
      ...t,
      count:
        t.value === "ALL"
          ? payments.length
          : payments.filter((p) => p.category === t.value).length,
    }));
  }, [payments]);

  // Open Reschedule Modal for 1 or multiple items
  const handleOpenRescheduleModal = (items: ScheduledPaymentItem[]) => {
    if (items.length === 0) return;
    setRescheduleTargets(items);
    const baseDate = items[0].scheduledDate || selectedDate || tomorrowIso;
    setNewScheduleDate(shiftIsoDate(baseDate, 1));
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (rescheduleTargets.length === 0 || !newScheduleDate) {
      showError("Selecciona una fecha válida para reprogramar");
      return;
    }

    setRescheduling(true);
    try {
      const res = await rescheduleScheduledPayments({
        ids: rescheduleTargets.map((p) => p.id),
        scheduledDate: newScheduleDate,
      });

      if (res.error || !res.data) {
        showError(
          res.error?.message || "No se pudo reprogramar la fecha de pago",
        );
        return;
      }

      setRescheduleModalOpen(false);
      showSuccess(
        rescheduleTargets.length === 1
          ? `Pago ${rescheduleTargets[0].folio} reprogramado para el ${formatDate(
              newScheduleDate,
              "DD/MM/YYYY",
            )}`
          : `${res.data.rescheduledCount} pagos reprogramados para el ${formatDate(
              newScheduleDate,
              "DD/MM/YYYY",
            )}`,
      );
      await fetchSchedule();
    } finally {
      setRescheduling(false);
    }
  };

  // Confirm Instant STP Dispersion
  const handleConfirmInstantStp = async () => {
    if (!instantStpTarget) return;

    setProcessingInstantStp(true);
    try {
      const res = await instantDisperseScheduledPayment(instantStpTarget.id);
      if (res.error || !res.data) {
        showError(
          res.error?.message || "No se pudo procesar el envío instantáneo STP",
        );
        return;
      }

      setLastStpResult({
        folio: res.data.folio,
        beneficiary: res.data.beneficiary,
        amount: res.data.amount,
        paymentReference: res.data.paymentReference,
      });
      setInstantStpTarget(null);
      showSuccess(
        `Envío instantáneo STP completado. Referencia: ${res.data.paymentReference}`,
      );
      await fetchSchedule();
    } finally {
      setProcessingInstantStp(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(ref);
      showSuccess(`Referencia ${ref} copiada al portapapeles`);
    }
  };

  const handleConfirmBatch = async () => {
    if (selectedPendingPayments.length === 0) return;

    setSubmittingBatch(true);
    try {
      const res = await disperseExpenseRequests({
        scheduledDate: viewAllDates ? undefined : selectedDate,
        items: selectedPendingPayments.map((p) => ({
          id: p.id,
          dispersionDate: p.scheduledDate,
        })),
      });

      if (res.error || !res.data) {
        showError(
          res.error?.message || "No se pudo confirmar el lote de dispersión",
        );
        return;
      }

      setConfirmModalOpen(false);
      setLastConfirmedBatchCode(res.data.batchCode);
      showSuccess(
        `Lote ${res.data.batchCode} confirmado: ${
          res.data.dispersedCount
        } pagos por ${formatCurrency(
          res.data.totalAmount,
        )} dispersados correctamente.`,
      );
      await fetchSchedule();
    } finally {
      setSubmittingBatch(false);
    }
  };

  return (
    <Stack direction="column" spacing={3}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Title title="Programación de Pagos y Dispersión SPEI / STP" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta fechas pasadas o futuras, reprograma vencimientos, ejecuta{" "}
            <strong>Envío Instantáneo (STP)</strong> o confirma el lote nocturno.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<Moon size={15} />}
            label="Corte nocturno SPEI: 23:00 hrs"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCw size={15} />}
            onClick={() => void fetchSchedule()}
            disabled={loading}
            sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 2 }}
          >
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {/* Date Navigation & Picker Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "12px",
          border: `1px solid ${muiTheme.palette.app.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title="Día anterior">
                <IconButton
                  size="small"
                  onClick={() => {
                    setViewAllDates(false);
                    setSelectedDate((prev) =>
                      shiftIsoDate(prev || todayIso, -1),
                    );
                  }}
                >
                  <ChevronLeft size={18} />
                </IconButton>
              </Tooltip>

              <Box sx={{ minWidth: 210 }}>
                <FormDatePicker
                  label="Fecha de programación"
                  value={viewAllDates ? "" : selectedDate}
                  onChange={(val) => {
                    if (val) {
                      setViewAllDates(false);
                      setSelectedDate(val);
                    }
                  }}
                  placeholder="DD/MM/YYYY"
                />
              </Box>

              <Tooltip title="Día siguiente">
                <IconButton
                  size="small"
                  onClick={() => {
                    setViewAllDates(false);
                    setSelectedDate((prev) =>
                      shiftIsoDate(prev || todayIso, 1),
                    );
                  }}
                >
                  <ChevronRight size={18} />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Button
                size="small"
                variant={
                  !viewAllDates && selectedDate === todayIso
                    ? "contained"
                    : "outlined"
                }
                onClick={() => {
                  setViewAllDates(false);
                  setSelectedDate(todayIso);
                }}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 2 }}
              >
                Hoy ({formatDate(todayIso, "DD/MM/YYYY")})
              </Button>
              <Button
                size="small"
                variant={
                  !viewAllDates && selectedDate === tomorrowIso
                    ? "contained"
                    : "outlined"
                }
                onClick={() => {
                  setViewAllDates(false);
                  setSelectedDate(tomorrowIso);
                }}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 2 }}
              >
                Mañana ({formatDate(tomorrowIso, "DD/MM/YYYY")})
              </Button>
              <Button
                size="small"
                variant={viewAllDates ? "contained" : "outlined"}
                color="primary"
                onClick={() => setViewAllDates(true)}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 2 }}
              >
                Todas las fechas
              </Button>
            </Stack>
          </Stack>

          {/* Available Dates with Scheduled Payments */}
          {availableDates.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Fechas con programación:
              </Typography>
              {availableDates.map((d) => {
                const isSelectedDate = !viewAllDates && selectedDate === d.date;
                return (
                  <Chip
                    key={d.date}
                    size="small"
                    icon={<Calendar size={13} />}
                    label={`${formatDate(d.date, "DD/MM/YYYY")} (${d.count})`}
                    color={isSelectedDate ? "primary" : "default"}
                    variant={isSelectedDate ? "filled" : "outlined"}
                    onClick={() => {
                      setViewAllDates(false);
                      setSelectedDate(d.date);
                    }}
                    sx={{ fontWeight: 600, cursor: "pointer" }}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Banner when Instant STP Transfer is completed */}
      {lastStpResult && (
        <Alert
          severity="success"
          icon={<Zap size={20} />}
          onClose={() => setLastStpResult(null)}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Copy size={14} />}
              onClick={() => handleCopyReference(lastStpResult.paymentReference)}
            >
              Copiar Referencia
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          <strong>Envío Instantáneo STP Exitoso:</strong> Pago{" "}
          <strong>{lastStpResult.folio}</strong> a{" "}
          <strong>{lastStpResult.beneficiary}</strong> por{" "}
          <strong>{formatCurrency(lastStpResult.amount)}</strong> dispersado.{" "}
          Clave de Rastreo STP:{" "}
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: alpha(muiTheme.palette.success.main, 0.15),
            }}
          >
            {lastStpResult.paymentReference}
          </Box>
        </Alert>
      )}

      {/* Banner when batch is confirmed */}
      {lastConfirmedBatchCode && (
        <Alert
          severity="success"
          icon={<CheckCircle2 size={20} />}
          onClose={() => setLastConfirmedBatchCode(null)}
          sx={{ borderRadius: 2 }}
        >
          <strong>Lote Nocturno Confirmado ({lastConfirmedBatchCode}):</strong>{" "}
          Los pagos autorizados han sido marcados como{" "}
          <strong>Pagados / Dispersados</strong> con su referencia SPEI.
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" color="text.secondary">
                Total Pendiente en Fecha
              </Typography>
              <Chip
                size="small"
                label={`${totalPendingCount} pendientes`}
                variant="outlined"
              />
            </Stack>
            <Typography variant="h2" sx={{ mt: 0.5 }}>
              {formatCurrency(totalPendingAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {viewAllDates
                ? "Todas las fechas programadas"
                : `Programación del ${formatDate(selectedDate, "DD/MM/YYYY")}`}
            </Typography>
            <SummaryCardIcon>
              <Wallet size={18} color={muiTheme.palette.text.secondary} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            sx={{
              border: `1.5px solid ${muiTheme.palette.primary.main}`,
              backgroundColor: alpha(muiTheme.palette.primary.main, 0.03),
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" color="primary.main" fontWeight={700}>
                A Dispersar en Lote
              </Typography>
              <Chip
                size="small"
                color="primary"
                label={`${selectedCount} seleccionados`}
              />
            </Stack>
            <Typography variant="h2" color="primary.main" sx={{ mt: 0.5 }}>
              {formatCurrency(totalTonightToDisperse)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pagos marcados con &ldquo;Sí Pagar&rdquo; para dispersión
            </Typography>
            <SummaryCardIcon>
              <Banknote size={18} color={muiTheme.palette.primary.main} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" color="text.secondary">
                Retenidos / Pospuestos
              </Typography>
              <Chip
                size="small"
                color={
                  totalPendingCount - selectedCount > 0 ? "warning" : "default"
                }
                label={`${totalPendingCount - selectedCount} excluidos`}
              />
            </Stack>
            <Typography
              variant="h2"
              color={totalExcluded > 0 ? "warning.main" : "text.primary"}
              sx={{ mt: 0.5 }}
            >
              {formatCurrency(totalExcluded)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Puedes reprogramarles una nueva fecha de pago
            </Typography>
            <SummaryCardIcon>
              <Clock size={18} color={muiTheme.palette.text.secondary} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>
      </Grid>

      {/* Tabs & Quick Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "12px",
          border: `1px solid ${muiTheme.palette.app.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <Stack spacing={2}>
          <TabFilters
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={(val) => setActiveTab(val)}
          />

          <Divider />

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            {/* Search */}
            <TextField
              size="small"
              placeholder="Buscar por folio, beneficiario, RFC, concepto, CLABE o referencia STP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { xs: "100%", md: 420 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        size={16}
                        color={muiTheme.palette.text.secondary}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch("")}>
                        <X size={14} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {/* Quick Selection & Bulk Actions */}
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckSquare size={15} />}
                onClick={() => void handleSelectAllPending(true)}
                disabled={
                  pendingPayments.length === 0 ||
                  selectedCount === totalPendingCount
                }
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 1.75 }}
              >
                Marcar todos
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Square size={15} />}
                onClick={() => void handleSelectAllPending(false)}
                disabled={selectedCount === 0}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 1.75 }}
              >
                Desmarcar todos
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<CalendarClock size={15} />}
                onClick={() =>
                  handleOpenRescheduleModal(selectedPendingPayments)
                }
                disabled={selectedCount === 0}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: 1.75 }}
              >
                Reprogramar seleccionados ({selectedCount})
              </Button>
              <Button
                size="medium"
                variant="contained"
                color="primary"
                startIcon={<Send size={16} />}
                disabled={selectedCount === 0 || submittingBatch}
                onClick={() => setConfirmModalOpen(true)}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  px: 2.25,
                }}
              >
                Confirmar Lote ({selectedCount})
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Payments Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: `1px solid ${muiTheme.palette.app.border}`,
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 1180 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 145, whiteSpace: "nowrap" }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Checkbox
                    size="small"
                    checked={allFilteredSelected}
                    indeterminate={someFilteredSelected}
                    disabled={pendingFilteredPayments.length === 0}
                    onChange={() => void handleToggleAllFiltered()}
                  />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Pagar
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ width: 165, whiteSpace: "nowrap" }}>
                Folio / Fechas
              </TableCell>
              <TableCell sx={{ width: 210, whiteSpace: "nowrap" }}>
                Beneficiario / RFC
              </TableCell>
              <TableCell sx={{ minWidth: 160 }}>Concepto</TableCell>
              <TableCell sx={{ width: 135, whiteSpace: "nowrap" }}>
                Categoría
              </TableCell>
              <TableCell sx={{ width: 140, whiteSpace: "nowrap" }}>
                Banco / CLABE
              </TableCell>
              <TableCell align="right" sx={{ width: 140, whiteSpace: "nowrap" }}>
                Monto Autorizado
              </TableCell>
              <TableCell align="center" sx={{ width: 160, whiteSpace: "nowrap" }}>
                Estatus / Referencia
              </TableCell>
              <TableCell align="center" sx={{ width: 310, minWidth: 310, whiteSpace: "nowrap" }}>
                Acciones de Pago
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Stack alignItems="center" spacing={1}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando programación de pagos...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="body1" color="text.secondary">
                      {viewAllDates
                        ? "No se encontraron pagos programados con los filtros seleccionados."
                        : `No hay pagos programados para la fecha ${formatDate(
                            selectedDate,
                            "DD/MM/YYYY",
                          )}.`}
                    </Typography>
                    {!viewAllDates && availableDates.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setViewAllDates(true)}
                      >
                        Ver todas las fechas con programación (
                        {availableDates.length})
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const isPaid = payment.status === "PAGADO";
                const isSelected = isPaid || payment.selectedForDispersion;

                return (
                  <TableRow
                    key={payment.id}
                    hover
                    sx={{
                      transition: "background-color 0.15s ease",
                      backgroundColor: isPaid
                        ? alpha(muiTheme.palette.success.main, 0.04)
                        : isSelected
                          ? alpha(muiTheme.palette.primary.main, 0.04)
                          : "transparent",
                      opacity: isSelected ? 1 : 0.68,
                    }}
                  >
                    {/* Decision Toggle: Sí Pagar / No Pagar */}
                    <TableCell>
                      {isPaid ? (
                        <Chip
                          size="small"
                          color="success"
                          icon={<CheckCircle2 size={14} />}
                          label="DISPERSADO"
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                        />
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Switch
                            size="small"
                            color="primary"
                            checked={payment.selectedForDispersion}
                            onChange={() => void handleTogglePayment(payment)}
                          />
                          <Chip
                            size="small"
                            icon={
                              payment.selectedForDispersion ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )
                            }
                            label={
                              payment.selectedForDispersion ? "SÍ PAGAR" : "NO"
                            }
                            color={
                              payment.selectedForDispersion
                                ? "primary"
                                : "default"
                            }
                            variant={
                              payment.selectedForDispersion
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => void handleTogglePayment(payment)}
                            sx={{
                              fontWeight: 700,
                              cursor: "pointer",
                              fontSize: "0.7rem",
                            }}
                          />
                        </Stack>
                      )}
                    </TableCell>

                    {/* Folio, Due Date (startDate) & Scheduled Date */}
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{
                              cursor: payment.expenseRequestId
                                ? "pointer"
                                : "default",
                              "&:hover": payment.expenseRequestId
                                ? {
                                    textDecoration: "underline",
                                    color: "primary.main",
                                  }
                                : undefined,
                            }}
                            onClick={() => {
                              if (payment.expenseRequestId) {
                                void router.push(
                                  `/facturas/solicitudes-gastos/${payment.expenseRequestId}`,
                                );
                              }
                            }}
                          >
                            {payment.folio}
                          </Typography>
                          {payment.expenseRequestId && (
                            <Tooltip title="Ver solicitud">
                              <IconButton
                                size="small"
                                sx={{ p: 0.25 }}
                                onClick={() =>
                                  void router.push(
                                    `/facturas/solicitudes-gastos/${payment.expenseRequestId}`,
                                  )
                                }
                              >
                                <ExternalLink size={12} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Calendar
                            size={12}
                            color={muiTheme.palette.text.secondary}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Vence: {formatDate(payment.dueDate, "DD/MM/YYYY")}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight={600}
                        >
                          Prog:{" "}
                          {formatDate(payment.scheduledDate, "DD/MM/YYYY")}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Beneficiary / RFC */}
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            maxWidth: 205,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={payment.beneficiary}
                        >
                          {payment.beneficiary}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          RFC: {payment.beneficiaryRfc || "Sin RFC"}
                        </Typography>
                        {payment.branch?.name && (
                          <Typography variant="caption" color="text.secondary">
                            Sucursal: {payment.branch.name}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Concept */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {payment.concept}
                      </Typography>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          CATEGORY_LABELS[payment.category] ?? payment.category
                        }
                        color={
                          CATEGORY_CHIP_COLORS[payment.category] ?? "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Bank / CLABE */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {payment.clabe ? (
                        <Stack spacing={0.25}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                          >
                            <Building2
                              size={14}
                              color={muiTheme.palette.text.secondary}
                            />
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {payment.bankName}
                            </Typography>
                          </Stack>
                          <Tooltip title={`CLABE: ${payment.clabe}`}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontFamily: "monospace",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              •••• {payment.clabe.slice(-4)}
                            </Typography>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="warning.main">
                          Sin CLABE en Deudor Diverso
                        </Typography>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color={isSelected ? "text.primary" : "text.secondary"}
                      >
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>

                    {/* Status & Payment Reference */}
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Stack spacing={0.5} alignItems="center">
                        <Chip
                          size="small"
                          label={isPaid ? "Pagado / Dispersado" : "Pendiente"}
                          color={isPaid ? "success" : "warning"}
                          variant="filled"
                          sx={{ fontWeight: 600, minWidth: 90 }}
                        />
                        {payment.paymentReference && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                          >
                            <Tooltip
                              title={`Referencia / Clave de Rastreo: ${payment.paymentReference}`}
                            >
                              <Typography
                                variant="caption"
                                color="success.main"
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {payment.paymentReference}
                              </Typography>
                            </Tooltip>
                            <Tooltip title="Copiar referencia">
                              <IconButton
                                size="small"
                                sx={{ p: 0.2 }}
                                onClick={() =>
                                  handleCopyReference(payment.paymentReference!)
                                }
                              >
                                <Copy size={11} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Row Actions: Reprogramar & Envío Instantáneo STP */}
                    <TableCell align="center" sx={{ width: 310, minWidth: 310, whiteSpace: "nowrap" }}>
                      {isPaid ? (
                        <Typography variant="caption" color="text.secondary">
                          {payment.dispersionMethod === "INSTANT_STP"
                            ? "Vía STP Instantáneo"
                            : "Vía Lote SPEI"}
                        </Typography>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                          sx={{ flexWrap: "nowrap" }}
                        >
                          <Tooltip title="Cambiar fecha programada de pago">
                            <Button
                              size="small"
                              variant="outlined"
                              color="inherit"
                              startIcon={<CalendarClock size={14} />}
                              onClick={() =>
                                handleOpenRescheduleModal([payment])
                              }
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.78rem",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                minHeight: 32,
                                height: 32,
                                maxHeight: 32,
                                px: 1.5,
                                borderColor: muiTheme.palette.divider,
                              }}
                            >
                              Reprogramar
                            </Button>
                          </Tooltip>

                          <Tooltip title="Dispersar ahora mismo vía STP (simula referencia SPEI)">
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<Zap size={14} />}
                              onClick={() => setInstantStpTarget(payment)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.78rem",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                minHeight: 32,
                                height: 32,
                                maxHeight: 32,
                                px: 1.5,
                              }}
                            >
                              Envío Instantáneo
                            </Button>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom Total Bar */}
      <Paper
        elevation={3}
        sx={{
          p: 2.5,
          borderRadius: "16px",
          border: `1px solid ${muiTheme.palette.app.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Moon size={18} color={muiTheme.palette.primary.main} />
              <Typography variant="subtitle1" fontWeight={700}>
                Total seleccionado a dispersar en lote:
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Se enviará archivo de lote SPEI con {selectedCount} pagos al corte
              nocturno, o bien puedes usar <strong>Envío Instantáneo</strong> en
              cualquier fila para dispersar al momento vía STP.
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={3}
            sx={{ flexShrink: 0 }}
          >
            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ whiteSpace: "nowrap" }}
              >
                Monto total neto
              </Typography>
              <Typography
                variant="h3"
                color="primary.main"
                fontWeight={800}
                sx={{ whiteSpace: "nowrap" }}
              >
                {formatCurrency(totalTonightToDisperse)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Send size={18} />}
              disabled={selectedCount === 0 || submittingBatch}
              onClick={() => setConfirmModalOpen(true)}
              sx={{
                px: 3,
                minHeight: 42,
                height: 42,
                maxHeight: 42,
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Confirmar Lote
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Modal 1: Reschedule Payment Date */}
      <Dialog
        open={rescheduleModalOpen}
        onClose={() => !rescheduling && setRescheduleModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <CalendarClock size={22} color={muiTheme.palette.primary.main} />
            <Typography variant="h5" fontWeight={700}>
              Reprogramar Fecha de Pago
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Selecciona la nueva fecha en la que se programará la dispersión de{" "}
              {rescheduleTargets.length === 1
                ? `la solicitud ${rescheduleTargets[0].folio}`
                : `los ${rescheduleTargets.length} pagos seleccionados`}
              :
            </Typography>

            <FormDatePicker
              label="Nueva fecha de programación"
              value={newScheduleDate}
              onChange={(val) => setNewScheduleDate(val)}
              placeholder="DD/MM/YYYY"
            />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`Hoy (${formatDate(todayIso, "DD/MM/YYYY")})`}
                onClick={() => setNewScheduleDate(todayIso)}
                color={newScheduleDate === todayIso ? "primary" : "default"}
                variant={newScheduleDate === todayIso ? "filled" : "outlined"}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                size="small"
                label={`Mañana (${formatDate(tomorrowIso, "DD/MM/YYYY")})`}
                onClick={() => setNewScheduleDate(tomorrowIso)}
                color={newScheduleDate === tomorrowIso ? "primary" : "default"}
                variant={
                  newScheduleDate === tomorrowIso ? "filled" : "outlined"
                }
                sx={{ cursor: "pointer" }}
              />
              <Chip
                size="small"
                label={`+2 días (${formatDate(
                  getLocalDateIso(2),
                  "DD/MM/YYYY",
                )})`}
                onClick={() => setNewScheduleDate(getLocalDateIso(2))}
                color={
                  newScheduleDate === getLocalDateIso(2) ? "primary" : "default"
                }
                variant={
                  newScheduleDate === getLocalDateIso(2) ? "filled" : "outlined"
                }
                sx={{ cursor: "pointer" }}
              />
              <Chip
                size="small"
                label={`+7 días (${formatDate(
                  getLocalDateIso(7),
                  "DD/MM/YYYY",
                )})`}
                onClick={() => setNewScheduleDate(getLocalDateIso(7))}
                color={
                  newScheduleDate === getLocalDateIso(7) ? "primary" : "default"
                }
                variant={
                  newScheduleDate === getLocalDateIso(7) ? "filled" : "outlined"
                }
                sx={{ cursor: "pointer" }}
              />
            </Stack>

            <Stack
              spacing={1}
              sx={{ maxHeight: 180, overflowY: "auto", pr: 0.5 }}
            >
              {rescheduleTargets.map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 1.25, borderRadius: 1.5 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {item.folio} — {item.beneficiary}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fecha actual:{" "}
                        {formatDate(item.scheduledDate, "DD/MM/YYYY")}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {formatCurrency(item.amount)}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRescheduleModalOpen(false)}
            disabled={rescheduling}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              rescheduling ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CalendarClock size={18} />
              )
            }
            disabled={rescheduling || !newScheduleDate}
            onClick={() => void handleConfirmReschedule()}
          >
            Guardar Nueva Fecha
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 2: Instant STP Dispersion */}
      <Dialog
        open={Boolean(instantStpTarget)}
        onClose={() => !processingInstantStp && setInstantStpTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Zap size={22} color={muiTheme.palette.secondary.main} />
            <Typography variant="h5" fontWeight={700}>
              Envío Instantáneo vía STP (SPEI)
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {instantStpTarget && (
            <Stack spacing={2.5}>
              <Alert severity="info" icon={<Zap size={20} />}>
                Esta operación ejecuta la dispersión inmediata vía{" "}
                <strong>STP (Sistema de Transferencias y Pagos)</strong>, genera
                la referencia de rastreo SPEI y marca el pago como{" "}
                <strong>Pagado / Dispersado</strong>.
              </Alert>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "background.lowerBlue",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Folio de Solicitud:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {instantStpTarget.folio}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Monto a Transferir:
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="secondary.main"
                    >
                      {formatCurrency(instantStpTarget.amount)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Beneficiario:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {instantStpTarget.beneficiary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      RFC: {instantStpTarget.beneficiaryRfc || "Sin RFC"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Cuenta CLABE Destino:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {instantStpTarget.bankName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {instantStpTarget.clabe || "Sin CLABE registrada"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Concepto de Pago:
                    </Typography>
                    <Typography variant="body2">
                      {instantStpTarget.concept}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setInstantStpTarget(null)}
            disabled={processingInstantStp}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={
              processingInstantStp ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Zap size={18} />
              )
            }
            disabled={processingInstantStp}
            onClick={() => void handleConfirmInstantStp()}
          >
            Ejecutar Envío Instantáneo STP
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 3: Confirmation of Nocturnal Batch Disbursement */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => !submittingBatch && setConfirmModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Moon size={22} color={muiTheme.palette.primary.main} />
            <Typography variant="h5" fontWeight={700}>
              Confirmar Dispersión Nocturna de Pagos
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info" icon={<Clock size={20} />}>
              La dispersión bancaria se procesará a las{" "}
              <strong>23:00 hrs</strong> vía banca empresarial SPEI para la fecha
              programada{" "}
              <strong>
                {viewAllDates
                  ? "seleccionada"
                  : formatDate(selectedDate, "DD/MM/YYYY")}
              </strong>
              .
            </Alert>

            {/* Financial summary in modal */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.lowerBlue",
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total a Dispersar:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {formatCurrency(totalTonightToDisperse)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pagos Autorizados:
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedCount} transacciones
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="subtitle2" fontWeight={600}>
              Detalle de pagos incluidos en este lote:
            </Typography>

            <Stack
              spacing={1}
              sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}
            >
              {selectedPendingPayments.map((p) => (
                <Stack
                  key={p.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1.25}
                  borderRadius={1.5}
                  bgcolor="background.paper"
                  border={`1px solid ${muiTheme.palette.divider}`}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {p.beneficiary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.folio} • Vence: {formatDate(p.dueDate, "DD/MM/YYYY")} •{" "}
                      {p.clabe
                        ? `${p.bankName} (•••• ${p.clabe.slice(-4)})`
                        : "Sin CLABE"}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {formatCurrency(p.amount)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {totalExcluded > 0 && (
              <Typography variant="caption" color="text.secondary">
                * <strong>{totalPendingCount - selectedCount} pagos</strong> no
                seleccionados ({formatCurrency(totalExcluded)}) mantendrán su
                estatus de <strong>Pendiente</strong> para la siguiente
                programación.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmModalOpen(false)}
            disabled={submittingBatch}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              submittingBatch ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircle2 size={18} />
              )
            }
            disabled={submittingBatch}
            onClick={() => void handleConfirmBatch()}
          >
            Autorizar y Programar Dispersión
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
