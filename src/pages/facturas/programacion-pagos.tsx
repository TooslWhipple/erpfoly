import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  CreditCard,
  Filter,
  Moon,
  RotateCcw,
  Search,
  Send,
  Square,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import numeral from "numeral";
import { Title, TabFilters } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  SummaryCard,
  SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";

export type PaymentCategory = "PROVEEDOR" | "GASTO_GENERAL" | "VIATICOS" | "CAJA_CHICA";

export interface DemoPaymentItem {
  id: string;
  folio: string;
  beneficiary: string;
  beneficiaryRfc: string;
  concept: string;
  category: PaymentCategory;
  categoryLabel: string;
  bankName: string;
  clabe: string;
  dueDate: string;
  amount: number;
  status: "PENDIENTE";
  statusLabel: string;
  selectedForTonight: boolean;
}

const INITIAL_DEMO_PAYMENTS: DemoPaymentItem[] = [
  {
    id: "PAY-001",
    folio: "FAC-2026-9041",
    beneficiary: "Maderería y Tableros del Norte S.A. de C.V.",
    beneficiaryRfc: "MTN980312KJ8",
    concept: "Suministro de MDF y triplay pino para producción",
    category: "PROVEEDOR",
    categoryLabel: "Proveedor",
    bankName: "BBVA",
    clabe: "012180001234567890",
    dueDate: "2026-11-05",
    amount: 148500.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: true,
  },
  {
    id: "PAY-002",
    folio: "VIA-2026-0012",
    beneficiary: "Carlos Mendoza Silva",
    beneficiaryRfc: "MESC880415AA1",
    concept: "Viáticos viaje prospección comercial Guadalajara y León",
    category: "VIATICOS",
    categoryLabel: "Viáticos",
    bankName: "Banorte",
    clabe: "072180009876543211",
    dueDate: "2026-11-05",
    amount: 18250.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: true,
  },
  {
    id: "PAY-003",
    folio: "FAC-2026-8812",
    beneficiary: "Herrajes y Correderas Finas de México",
    beneficiaryRfc: "HCF1206199L2",
    concept: "Correderas telescópicas y bisagras bidimensionales",
    category: "PROVEEDOR",
    categoryLabel: "Proveedor",
    bankName: "Santander",
    clabe: "014180005544332211",
    dueDate: "2026-11-05",
    amount: 62400.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: true,
  },
  {
    id: "PAY-004",
    folio: "GTO-2026-0491",
    beneficiary: "Inmobiliaria Foly Centro S.A.P.I.",
    beneficiaryRfc: "IFC150101XYZ",
    concept: "Renta de nave industrial y bodega matriz mes corriente",
    category: "GASTO_GENERAL",
    categoryLabel: "Gasto General",
    bankName: "Citibanamex",
    clabe: "002180007788990012",
    dueDate: "2026-11-05",
    amount: 85000.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: true,
  },
  {
    id: "PAY-005",
    folio: "CCH-2026-0003",
    beneficiary: "Brenda López Garza (Caja Sucursal Sur)",
    beneficiaryRfc: "LOGB9208034M9",
    concept: "Reposición de fondo fijo de caja chica semana 45",
    category: "CAJA_CHICA",
    categoryLabel: "Caja Chica",
    bankName: "BBVA",
    clabe: "012180004455667788",
    dueDate: "2026-11-05",
    amount: 7890.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: false,
  },
  {
    id: "PAY-006",
    folio: "FAC-2026-9102",
    beneficiary: "Comercializadora de Pinturas y Lacas S.A.",
    beneficiaryRfc: "CPL050720PT3",
    concept: "Lote de esmaltes, barniz poliuretano y solventes",
    category: "PROVEEDOR",
    categoryLabel: "Proveedor",
    bankName: "Scotiabank",
    clabe: "044180006677889900",
    dueDate: "2026-11-05",
    amount: 39750.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: false,
  },
  {
    id: "PAY-007",
    folio: "GTO-2026-0504",
    beneficiary: "Amazon Web Services Inc. (Factura México)",
    beneficiaryRfc: "AWS170912MX1",
    concept: "Infraestructura de servidores en la nube y bases de datos",
    category: "GASTO_GENERAL",
    categoryLabel: "Gasto General",
    bankName: "HSBC",
    clabe: "021180003322114455",
    dueDate: "2026-11-05",
    amount: 24600.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: true,
  },
  {
    id: "PAY-008",
    folio: "VIA-2026-0015",
    beneficiary: "Ing. Roberto Almonte Peña",
    beneficiaryRfc: "AOPR791124H60",
    concept: "Supervisión técnica de montaje sucursal Saltillo",
    category: "VIATICOS",
    categoryLabel: "Viáticos",
    bankName: "Banorte",
    clabe: "072180001122334455",
    dueDate: "2026-11-05",
    amount: 9800.0,
    status: "PENDIENTE",
    statusLabel: "Pendiente",
    selectedForTonight: false,
  },
];

const CATEGORY_TABS: TabOption[] = [
  { label: "Todos", value: "ALL" },
  { label: "Proveedores", value: "PROVEEDOR" },
  { label: "Gastos Generales", value: "GASTO_GENERAL" },
  { label: "Viáticos", value: "VIATICOS" },
  { label: "Caja Chica", value: "CAJA_CHICA" },
];

const CATEGORY_CHIP_COLORS: Record<
  PaymentCategory,
  "primary" | "info" | "secondary" | "success"
> = {
  PROVEEDOR: "primary",
  GASTO_GENERAL: "info",
  VIATICOS: "secondary",
  CAJA_CHICA: "success",
};

function formatCurrency(val: number): string {
  return numeral(val).format("$0,0.00");
}

export default function ProgramacionPagosPage() {
  const muiTheme = useTheme();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [payments, setPayments] = useState<DemoPaymentItem[]>(INITIAL_DEMO_PAYMENTS);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [batchConfirmed, setBatchConfirmed] = useState(false);

  // Toggle single payment
  const handleTogglePayment = (id: string) => {
    setPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, selectedForTonight: !item.selectedForTonight }
          : item,
      ),
    );
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
        item.beneficiaryRfc.toLowerCase().includes(term) ||
        item.concept.toLowerCase().includes(term) ||
        item.bankName.toLowerCase().includes(term) ||
        item.clabe.includes(term);

      return matchCategory && matchSearch;
    });
  }, [payments, activeTab, search]);

  // Bulk actions
  const allFilteredSelected =
    filteredPayments.length > 0 &&
    filteredPayments.every((item) => item.selectedForTonight);

  const someFilteredSelected =
    filteredPayments.some((item) => item.selectedForTonight) &&
    !allFilteredSelected;

  const handleToggleAllFiltered = () => {
    const targetState = !allFilteredSelected;
    const filteredIds = new Set(filteredPayments.map((p) => p.id));
    setPayments((prev) =>
      prev.map((item) =>
        filteredIds.has(item.id)
          ? { ...item, selectedForTonight: targetState }
          : item,
      ),
    );
  };

  const handleSelectAll = (select: boolean) => {
    setPayments((prev) =>
      prev.map((item) => ({ ...item, selectedForTonight: select })),
    );
  };

  const handleResetDemo = () => {
    setPayments(INITIAL_DEMO_PAYMENTS);
    setBatchConfirmed(false);
    showSuccess("Datos de demostración reiniciados");
  };

  // Metrics
  const totalCommitments = useMemo(
    () => payments.reduce((acc, curr) => acc + curr.amount, 0),
    [payments],
  );

  const totalTonightToDisperse = useMemo(
    () =>
      payments
        .filter((item) => item.selectedForTonight)
        .reduce((acc, curr) => acc + curr.amount, 0),
    [payments],
  );

  const totalExcluded = totalCommitments - totalTonightToDisperse;

  const selectedCount = useMemo(
    () => payments.filter((item) => item.selectedForTonight).length,
    [payments],
  );

  const totalCount = payments.length;

  const handleConfirmBatch = () => {
    setBatchConfirmed(true);
    setConfirmModalOpen(false);
    showSuccess(
      `¡Lote de dispersión programado con éxito! Se dispersarán ${formatCurrency(
        totalTonightToDisperse,
      )} hoy a las 23:00 hrs.`,
    );
  };

  const tabsWithCount = CATEGORY_TABS.map((tab) => {
    const count =
      tab.value === "ALL"
        ? payments.length
        : payments.filter((p) => p.category === tab.value).length;
    return { ...tab, count };
  });

  return (
    <Stack direction="column" spacing={3}>
      {/* Title & Batch Action */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Title title="Programación de pagos" />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Clock size={16} color={muiTheme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">
              Dispersión programada para hoy en la noche • Corte bancario:{" "}
              <strong>23:00 hrs</strong>
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Restablecer datos de prueba">
            <IconButton onClick={handleResetDemo} size="small" color="default">
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Moon size={18} />}
            disabled={selectedCount === 0}
            onClick={() => setConfirmModalOpen(true)}
            sx={{ px: 3, fontWeight: 600, textTransform: "none" }}
          >
            Autorizar Dispersión Nocturna ({selectedCount})
          </Button>
        </Stack>
      </Stack>

      {/* Confirmation Banner if already scheduled */}
      {batchConfirmed && (
        <Alert
          severity="success"
          icon={<CheckCircle2 size={22} />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setBatchConfirmed(false)}
            >
              Modificar lote
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Lote de dispersión nocturna confirmado para hoy a las 23:00 hrs
          </Typography>
          <Typography variant="body2">
            Se autorizaron <strong>{selectedCount}</strong> pagos por un total de{" "}
            <strong>{formatCurrency(totalTonightToDisperse)}</strong>. El motor
            de dispersión SPEI procesará las transferencias automáticamente en el
            corte nocturno.
          </Typography>
        </Alert>
      )}

      {/* KPI Cards Top Section */}
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            sx={{
              backgroundColor: alpha(muiTheme.palette.primary.main, 0.06),
              borderColor: alpha(muiTheme.palette.primary.main, 0.3),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Moon size={16} color={muiTheme.palette.primary.main} />
              <Typography variant="h6" color="primary.main" fontWeight={700}>
                A Dispersar Hoy Noche
              </Typography>
            </Stack>
            <Typography variant="h2" color="primary.main" fontWeight={800}>
              {formatCurrency(totalTonightToDisperse)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedCount} de {totalCount} pagos autorizados
            </Typography>
            <SummaryCardIcon>
              <Banknote size={22} color={muiTheme.palette.primary.main} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard>
            <Typography variant="h6">Compromisos del Día</Typography>
            <Typography variant="h2">
              {formatCurrency(totalCommitments)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total programable para la jornada
            </Typography>
            <SummaryCardIcon>
              <Calendar size={20} color={muiTheme.palette.text.secondary} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard>
            <Typography variant="h6">Excluidos / No se pagará</Typography>
            <Typography
              variant="h2"
              color={totalExcluded > 0 ? "warning.main" : "text.secondary"}
            >
              {formatCurrency(totalExcluded)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalCount - selectedCount} pagos pendientes para siguiente fecha
            </Typography>
            <SummaryCardIcon>
              <Wallet size={20} color={muiTheme.palette.text.secondary} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard>
            <Typography variant="h6">Estatus del Lote</Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 0.5 }}>
              <Chip
                label="Pendiente de dispersión"
                color="warning"
                variant="filled"
                size="medium"
                icon={<Clock size={16} />}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Listo para envío bancario en el corte nocturno
            </Typography>
            <SummaryCardIcon>
              <AlertCircle size={20} color={muiTheme.palette.text.secondary} />
            </SummaryCardIcon>
          </SummaryCard>
        </Grid>
      </Grid>

      {/* Tabs and Quick Selection Bar */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <TabFilters
          tabs={tabsWithCount}
          activeTab={activeTab}
          onTabChange={(val) => setActiveTab(val)}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<CheckSquare size={16} />}
            onClick={() => handleSelectAll(true)}
            sx={{ textTransform: "none", fontSize: "0.8125rem" }}
          >
            Pagar todos
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Square size={16} />}
            onClick={() => handleSelectAll(false)}
            sx={{ textTransform: "none", fontSize: "0.8125rem" }}
          >
            No pagar ninguno
          </Button>
        </Stack>
      </Stack>

      {/* Search Input Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por folio, beneficiario, RFC, concepto, banco o cuenta CLABE..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={muiTheme.palette.text.secondary} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch("")}>
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          backgroundColor: "background.paper",
          borderRadius: 2,
        }}
      />

      {/* Interactive Payments Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${muiTheme.palette.app.border}`,
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ backgroundColor: "background.lowerBlue" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ pl: 2 }}>
                <Tooltip
                  title={
                    allFilteredSelected
                      ? "Deseleccionar filtrados"
                      : "Seleccionar filtrados para pagar hoy"
                  }
                >
                  <Checkbox
                    color="primary"
                    indeterminate={someFilteredSelected}
                    checked={allFilteredSelected}
                    onChange={handleToggleAllFiltered}
                  />
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 140 }}>
                ¿Se Paga Hoy?
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Folio</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Beneficiario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Concepto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tipo de Gasto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Datos Bancarios</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Monto
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Estatus
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron pagos con los filtros seleccionados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const isSelected = payment.selectedForTonight;

                return (
                  <TableRow
                    key={payment.id}
                    hover
                    selected={isSelected}
                    onClick={() => handleTogglePayment(payment.id)}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      backgroundColor: isSelected
                        ? alpha(muiTheme.palette.primary.main, 0.04)
                        : "inherit",
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={() => handleTogglePayment(payment.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    {/* Switch / Toggle indicator */}
                    <TableCell>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Switch
                          size="small"
                          color="primary"
                          checked={isSelected}
                          onChange={() => handleTogglePayment(payment.id)}
                        />
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color={isSelected ? "primary.main" : "text.secondary"}
                        >
                          {isSelected ? "SÍ PAGAR" : "NO"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Folio */}
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {payment.folio}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Vence: {payment.dueDate}
                      </Typography>
                    </TableCell>

                    {/* Beneficiary */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {payment.beneficiary}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        RFC: {payment.beneficiaryRfc}
                      </Typography>
                    </TableCell>

                    {/* Concept */}
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        title={payment.concept}
                      >
                        {payment.concept}
                      </Typography>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={payment.categoryLabel}
                        color={CATEGORY_CHIP_COLORS[payment.category]}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Bank / CLABE */}
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Building2 size={14} color={muiTheme.palette.text.secondary} />
                          <Typography variant="caption" fontWeight={600}>
                            {payment.bankName}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          •••• {payment.clabe.slice(-4)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Amount */}
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color={isSelected ? "text.primary" : "text.secondary"}
                      >
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>

                    {/* Status: Pendiente */}
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={payment.statusLabel}
                        color="warning"
                        variant="filled"
                        sx={{ fontWeight: 600, minWidth: 80 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Floating Bottom Total Bar */}
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
                Total seleccionado a dispersar hoy en la noche:
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Se enviará archivo de lote SPEI con {selectedCount} pagos al corte
              nocturno. Los pagos no seleccionados permanecerán con estatus
              pendiente.
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={3}>
            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Monto total neto
              </Typography>
              <Typography
                variant="h3"
                color="primary.main"
                fontWeight={800}
              >
                {formatCurrency(totalTonightToDisperse)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Send size={18} />}
              disabled={selectedCount === 0}
              onClick={() => setConfirmModalOpen(true)}
              sx={{ px: 3, py: 1.25, fontWeight: 700, textTransform: "none" }}
            >
              Confirmar Lote
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Modal Confirmation of Nocturnal Disbursement */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
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
              La dispersión bancaria se procesará hoy automáticamente a las{" "}
              <strong>23:00 hrs</strong> vía banca empresarial SPEI.
            </Alert>

            {/* Financial summary in modal */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, backgroundColor: "background.lowerBlue" }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total a Dispersar:
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
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

            <Stack spacing={1} sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
              {payments
                .filter((p) => p.selectedForTonight)
                .map((p) => (
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
                        {p.folio} • {p.bankName} (•••• {p.clabe.slice(-4)})
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
                * <strong>{totalCount - selectedCount} pagos</strong> no
                seleccionados ({formatCurrency(totalExcluded)}) mantendrán su
                estatus de <strong>Pendiente</strong> para la siguiente
                programación.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircle2 size={18} />}
            onClick={handleConfirmBatch}
          >
            Autorizar y Programar Dispersión
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
