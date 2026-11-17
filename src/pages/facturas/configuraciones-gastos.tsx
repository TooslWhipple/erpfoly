import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import numeral from "numeral";
import { TabFilters, Title } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import {
  getExpenseRequestConfig,
  getPettyCashConfigs,
  updateExpenseRequestConfig,
  updatePettyCashConfig,
} from "@/services/expense-configs.service";
import type { PettyCashBranchConfig } from "@/types/expense-configs.types";
import { EXPENSE_CONFIGS_UPDATE } from "@/lib/permissions";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";

type ConfigTab = "petty-cash" | "expense-requests";

const CONFIG_TABS: TabOption[] = [
  { label: "Caja chica (por sucursal)", value: "petty-cash" },
  { label: "Solicitudes de gastos", value: "expense-requests" },
];

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function parseOptionalAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

export default function ConfiguracionesGastosPage() {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const currentUser = useAuthStore((s) => s.user);
  const canUpdate = Boolean(
    currentUser?.permissions?.includes(EXPENSE_CONFIGS_UPDATE),
  );

  const [activeTab, setActiveTab] = useState<ConfigTab>("petty-cash");
  const [branchSearch, setBranchSearch] = useState("");
  const [maxBalanceDrafts, setMaxBalanceDrafts] = useState<
    Record<number, string>
  >({});
  const [savingBranchId, setSavingBranchId] = useState<number | null>(null);

  const [deadlineDays, setDeadlineDays] = useState<string>("5");
  const [savingExpenseConfig, setSavingExpenseConfig] = useState(false);

  const {
    data: pettyCashConfigs = [],
    isLoading: loadingPettyCash,
    isError: pettyCashError,
    error: pettyCashErrorObj,
  } = useQuery({
    queryKey: ["expense-configs-petty-cash"],
    queryFn: async () => {
      const res = await getPettyCashConfigs();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  const {
    data: expenseRequestConfig,
    isLoading: loadingExpenseConfig,
    isError: expenseConfigError,
    error: expenseConfigErrorObj,
  } = useQuery({
    queryKey: ["expense-configs-expense-requests"],
    queryFn: async () => {
      const res = await getExpenseRequestConfig();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? null;
    },
  });

  useEffect(() => {
    if (pettyCashError) {
      showError(
        pettyCashErrorObj?.message ??
          "No se pudieron cargar las configuraciones de caja chica",
      );
    }
  }, [pettyCashError, pettyCashErrorObj, showError]);

  useEffect(() => {
    if (expenseConfigError) {
      showError(
        expenseConfigErrorObj?.message ??
          "No se pudo cargar la configuración de solicitudes de gastos",
      );
    }
  }, [expenseConfigError, expenseConfigErrorObj, showError]);

  useEffect(() => {
    if (pettyCashConfigs.length > 0) {
      const next: Record<number, string> = {};
      for (const item of pettyCashConfigs) {
        next[item.branchId] =
          item.maxBalance != null ? String(item.maxBalance) : "";
      }
      setMaxBalanceDrafts(next);
    }
  }, [pettyCashConfigs]);

  useEffect(() => {
    if (expenseRequestConfig) {
      setDeadlineDays(String(expenseRequestConfig.verificationDeadlineDays));
    }
  }, [expenseRequestConfig]);

  const filteredBranches = useMemo(() => {
    const q = branchSearch.trim().toLowerCase();
    if (!q) return pettyCashConfigs;
    return pettyCashConfigs.filter((b) =>
      b.branchName.toLowerCase().includes(q),
    );
  }, [pettyCashConfigs, branchSearch]);

  const handleDraftChange = (branchId: number, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setMaxBalanceDrafts((prev) => ({
      ...prev,
      [branchId]: value,
    }));
  };

  const isRowDirty = (item: PettyCashBranchConfig): boolean => {
    const draft = maxBalanceDrafts[item.branchId];
    if (draft === undefined) return false;
    const origMaxBal = item.maxBalance != null ? String(item.maxBalance) : "";
    return draft !== origMaxBal;
  };

  const handleSaveBranch = async (item: PettyCashBranchConfig) => {
    const draft = maxBalanceDrafts[item.branchId] ?? "";
    const maxBalance = parseOptionalAmount(draft);

    setSavingBranchId(item.branchId);
    try {
      const res = await updatePettyCashConfig(item.branchId, {
        maxBalance,
      });
      if (res.error) {
        showError(
          res.error.message ??
            "No se pudo guardar la configuración de la sucursal",
        );
        return;
      }

      const prevMax = item.maxBalance ?? 0;
      const diff = maxBalance !== null && maxBalance > prevMax
        ? maxBalance - prevMax
        : 0;

      showSuccess(
        diff > 0
          ? `Configuración guardada para ${item.branchName}. Se sumaron ${formatCurrency(diff)} al saldo actual.`
          : `Configuración guardada para ${item.branchName}`,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["expense-configs-petty-cash"],
        }),
        queryClient.invalidateQueries({ queryKey: ["petty-cash-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["petty-cash-movements"] }),
      ]);
    } finally {
      setSavingBranchId(null);
    }
  };

  const handleSaveExpenseConfig = async () => {
    const parsed = Number.parseInt(deadlineDays, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      showError("Ingresa un número entero válido mayor o igual a 0.");
      return;
    }

    setSavingExpenseConfig(true);
    try {
      const res = await updateExpenseRequestConfig({
        verificationDeadlineDays: parsed,
      });
      if (res.error) {
        showError(
          res.error.message ??
            "No se pudo guardar la configuración de solicitudes de gastos",
        );
        return;
      }
      showSuccess("Configuración de solicitudes de gastos actualizada");
      await queryClient.invalidateQueries({
        queryKey: ["expense-configs-expense-requests"],
      });
    } finally {
      setSavingExpenseConfig(false);
    }
  };

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Configuración de gastos" />

      <TabFilters
        tabs={CONFIG_TABS}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as ConfigTab)}
        showSearch={activeTab === "petty-cash"}
        searchValue={branchSearch}
        onSearchChange={setBranchSearch}
        searchPlaceholder="Buscar sucursal..."
      />

      {activeTab === "petty-cash" ? (
        <Stack spacing={2}>
          <Alert severity="info">
            Define por sucursal el <strong>límite de saldo</strong> de caja chica
            (el cual también será el <strong>monto máximo a comprobar</strong>{" "}
            por solicitud). Si el nuevo límite de saldo es mayor al anterior, la
            diferencia se sumará automáticamente al saldo actual de la caja
            chica.
          </Alert>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sucursal</TableCell>
                  <TableCell align="right">Saldo actual</TableCell>
                  <TableCell align="right" sx={{ minWidth: 240 }}>
                    Límite de saldo (Máx. a comprobar)
                  </TableCell>
                  <TableCell align="right" sx={{ width: 140 }}>
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPettyCash ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : filteredBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron sucursales
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBranches.map((item) => {
                    const draft = maxBalanceDrafts[item.branchId] ?? "";
                    const dirty = isRowDirty(item);
                    const saving = savingBranchId === item.branchId;

                    return (
                      <TableRow key={item.branchId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.branchName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(item.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            placeholder="Sin límite"
                            value={draft}
                            onChange={(e) =>
                              handleDraftChange(item.branchId, e.target.value)
                            }
                            disabled={!canUpdate || saving}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={{ width: 190 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant={dirty ? "contained" : "outlined"}
                            startIcon={
                              saving ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                <Save size={15} />
                              )
                            }
                            disabled={!canUpdate || saving || !dirty}
                            onClick={() => handleSaveBranch(item)}
                          >
                            Guardar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      ) : (
        <Box maxWidth={620}>
          <Card variant="outlined">
            <CardContent>
              {loadingExpenseConfig ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress size={28} />
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight={600}>
                      Plazo límite de comprobación
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Define cuántos días naturales tienen los solicitantes para
                      cargar sus comprobantes después de la fecha límite (fecha
                      de fin) de la solicitud de gastos o viáticos.
                    </Typography>
                  </Stack>

                  <TextField
                    label="Días límite de comprobación después de la fecha límite"
                    type="number"
                    value={deadlineDays}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+$/.test(val)) {
                        setDeadlineDays(val);
                      }
                    }}
                    disabled={!canUpdate || savingExpenseConfig}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">días</InputAdornment>
                        ),
                      },
                      htmlInput: { min: 0 },
                    }}
                    helperText="Ejemplo: si la solicitud termina el 10 del mes y se configuran 5 días, se podrá comprobar hasta el 15 del mes."
                    fullWidth
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={
                        savingExpenseConfig ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Save size={16} />
                        )
                      }
                      disabled={!canUpdate || savingExpenseConfig}
                      onClick={handleSaveExpenseConfig}
                    >
                      Guardar configuración
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Stack>
  );
}
