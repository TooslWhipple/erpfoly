import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
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
  CalendarRange,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import numeral from "numeral";
import dayjs from "dayjs";
import { getDiverseDebtorExpenses } from "@/services/diverse-debtor-expenses.service";
import type { DiverseDebtorExpense } from "@/types/diverse-debtor-expenses.types";
import { DiverseDebtorExpenseInstallmentsModal } from "./DiverseDebtorExpenseInstallmentsModal";

interface DiverseDebtorExpensesListTabProps {
  onRefreshNeeded?: () => void;
}

export function DiverseDebtorExpensesListTab({
  onRefreshNeeded,
}: DiverseDebtorExpensesListTabProps) {
  const theme = useTheme();

  const [expenses, setExpenses] = useState<DiverseDebtorExpense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal para ver quincenas de un gasto
  const [selectedExpenseForInstallments, setSelectedExpenseForInstallments] =
    useState<DiverseDebtorExpense | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getDiverseDebtorExpenses({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      if (res.data) {
        setExpenses(res.data.rows);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } else {
        setErrorMsg(res.error?.message || "Error al cargar gastos de deudores.");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Error al cargar gastos de deudores.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleUpdatedFromModal = () => {
    fetchExpenses();
    onRefreshNeeded?.();
  };

  return (
    <Stack spacing={3}>
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar por colaborador, número de empleado, folio o concepto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <Search size={18} style={{ marginRight: 8, opacity: 0.6 }} />
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-exp-filter">Estatus del Gasto</InputLabel>
              <Select
                labelId="status-exp-filter"
                value={statusFilter}
                label="Estatus del Gasto"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="ALL">Todos los estatus</MenuItem>
                <MenuItem value="ACTIVE">En descuentos activos</MenuItem>
                <MenuItem value="COMPLETED">Liquidados / Concluidos</MenuItem>
                <MenuItem value="CANCELLED">Cancelados</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 2, md: 4 }}>
            <Stack direction="row" spacing={1} justifyContent={{ sm: "flex-end" }}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<RefreshCw size={16} />}
                onClick={fetchExpenses}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Gastos */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        {loading && <CircularProgress size={24} sx={{ m: 2 }} />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Folio</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Colaborador / Deudor</TableCell>
              <TableCell>Descripción del Cobro</TableCell>
              <TableCell align="right">Monto Original</TableCell>
              <TableCell align="center">Plazo</TableCell>
              <TableCell align="right">Por Quincena</TableCell>
              <TableCell align="right">Saldo Pendiente</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Progreso</TableCell>
              <TableCell>Estatus</TableCell>
              <TableCell>Evidencia</TableCell>
              <TableCell align="center">Quincenas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading
                      ? "Cargando gastos..."
                      : "No se encontraron cobros ni gastos registrados para deudores diversos."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((exp) => {
                const isCompleted = exp.status === "COMPLETED";
                const isCancelled = exp.status === "CANCELLED";
                const formattedDate = dayjs(exp.date).format("DD/MM/YYYY");

                return (
                  <TableRow key={exp.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                      {exp.folio}
                    </TableCell>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>
                      <Stack spacing={0.2}>
                        <Typography variant="body2" fontWeight={600}>
                          {exp.debtor?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.debtor?.employeeNumber}
                          {exp.debtor?.branchName ? ` • ${exp.debtor.branchName}` : ""}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ maxWidth: 220 }}
                        title={exp.description}
                      >
                        {exp.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {numeral(exp.amount).format("$0,0.00")}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={`${exp.installmentsCount} Qnas`}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: "primary.main", fontWeight: 600 }}>
                      {numeral(exp.installmentAmount).format("$0,0.00")}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 800,
                        color: exp.remainingAmount > 0 ? "warning.main" : "success.main",
                      }}
                    >
                      {numeral(exp.remainingAmount).format("$0,0.00")}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">
                            {exp.progress?.confirmedCount || 0}/{exp.installmentsCount}
                          </Typography>
                          <Typography variant="caption" fontWeight={700}>
                            {exp.progress?.percentage || 0}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={exp.progress?.percentage || 0}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={isCompleted ? "success" : "primary"}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          isCompleted
                            ? "Liquidado"
                            : isCancelled
                            ? "Cancelado"
                            : "Activo"
                        }
                        color={
                          isCompleted
                            ? "success"
                            : isCancelled
                            ? "default"
                            : "primary"
                        }
                        variant={isCompleted ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      {exp.evidenceUrl ? (
                        <Tooltip title="Ver evidencia adjunta">
                          <IconButton
                            size="small"
                            color="primary"
                            href={exp.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Sin archivo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver desglose de quincenas">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedExpenseForInstallments(exp)}
                        >
                          <CalendarRange size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Stack>
      )}

      {/* Modal de Detalle de Quincenas */}
      {selectedExpenseForInstallments && (
        <DiverseDebtorExpenseInstallmentsModal
          expense={selectedExpenseForInstallments}
          open={Boolean(selectedExpenseForInstallments)}
          onClose={() => setSelectedExpenseForInstallments(null)}
          onUpdated={handleUpdatedFromModal}
        />
      )}
    </Stack>
  );
}
