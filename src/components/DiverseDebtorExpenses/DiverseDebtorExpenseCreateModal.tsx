import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Calendar,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import numeral from "numeral";
import { FormDatePicker, FormTextField } from "@/components/Form";
import { getDiverseDebtorsCatalog } from "@/services/diverse-debtors.service";
import { createDiverseDebtorExpense } from "@/services/diverse-debtor-expenses.service";
import type { DiverseDebtorListItem } from "@/types/diverse-debtors.types";
import { calculateFortnightSchedulePreview } from "@/utils/fortnightCalculator";

interface DiverseDebtorExpenseCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DiverseDebtorExpenseCreateModal({
  open,
  onClose,
  onSuccess,
}: DiverseDebtorExpenseCreateModalProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingDebtors, setLoadingDebtors] = useState(false);
  const [debtorsList, setDebtorsList] = useState<DiverseDebtorListItem[]>([]);
  const [selectedDebtor, setSelectedDebtor] =
    useState<DiverseDebtorListItem | null>(null);

  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [amountStr, setAmountStr] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [installmentsCount, setInstallmentsCount] = useState<number>(4);
  const [notes, setNotes] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setLoadingDebtors(true);
      getDiverseDebtorsCatalog()
        .then((list) => {
          if (Array.isArray(list)) {
            setDebtorsList(list);
          }
        })
        .finally(() => setLoadingDebtors(false));
    } else {
      setSelectedDebtor(null);
      setAmountStr("");
      setDescription("");
      setInstallmentsCount(4);
      setNotes("");
      setSelectedFile(null);
      setPreviewOpen(false);
      setErrorMessage(null);
    }
  }, [open]);

  const parsedAmount = useMemo(() => {
    const val = Number(amountStr);
    return Number.isFinite(val) && val > 0 ? val : 0;
  }, [amountStr]);

  const schedulePreview = useMemo(() => {
    if (parsedAmount <= 0 || !date) return [];
    return calculateFortnightSchedulePreview(
      parsedAmount,
      installmentsCount,
      date,
    );
  }, [parsedAmount, installmentsCount, date]);

  const installmentAmountApprox = useMemo(() => {
    if (parsedAmount <= 0 || installmentsCount <= 0) return 0;
    return parsedAmount / installmentsCount;
  }, [parsedAmount, installmentsCount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!selectedDebtor) {
      setErrorMessage("Por favor selecciona un deudor diverso / colaborador responsable.");
      return;
    }
    if (!date) {
      setErrorMessage("Por favor ingresa la fecha del cobro / gasto.");
      return;
    }
    if (parsedAmount <= 0) {
      setErrorMessage("El monto debe ser mayor a $0.00.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Por favor ingresa la descripción o concepto del cobro.");
      return;
    }
    if (installmentsCount < 1 || installmentsCount > 24) {
      setErrorMessage("El plazo de quincenas debe ser entre 1 y 24.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createDiverseDebtorExpense({
        diverseDebtorId: selectedDebtor.id,
        date,
        amount: parsedAmount,
        description: description.trim(),
        installmentsCount,
        notes: notes.trim() || undefined,
        file: selectedFile || undefined,
      });

      if (res.data) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error?.message || "Error al registrar el gasto del deudor.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Error al registrar el gasto del deudor.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Users size={22} color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={700}>
            Nuevo Gasto / Cobro a Deudor Diverso
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Selector de Deudor Diverso */}
          <Autocomplete
            options={debtorsList}
            loading={loadingDebtors}
            value={selectedDebtor}
            onChange={(_, val) => setSelectedDebtor(val)}
            getOptionLabel={(opt) =>
              `${opt.fullName} (${opt.employeeNumber})${
                opt.branch?.name ? ` • ${opt.branch.name}` : ""
              }`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Responsable / Deudor Diverso *"
                placeholder="Buscar por nombre o número de empleado..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <User size={18} style={{ marginRight: 8, opacity: 0.6 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {loadingDebtors ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Fecha y Monto */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormDatePicker
                label="Fecha del gasto / cobro *"
                value={date}
                onChange={(val) => setDate(val || "")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                label="Monto Total ($ MXN) *"
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                inputProps={{ min: 0.01, step: "0.01" }}
              />
            </Grid>
          </Grid>

          {/* Descripción */}
          <FormTextField
            label="Descripción del cobro *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Anticipo de compra de equipo, préstamo de nómina, viático no justificado..."
            multiline
            rows={2}
          />

          {/* Plazo en Quincenas (1 a 24) */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              borderColor: alpha(theme.palette.primary.main, 0.25),
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarRange size={20} color={theme.palette.primary.main} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    ¿A cuántas quincenas se descontará? (1 a 24)
                  </Typography>
                </Stack>
                <Chip
                  color="primary"
                  label={`${installmentsCount} quincena${
                    installmentsCount > 1 ? "s" : ""
                  }`}
                  sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                />
              </Stack>

              <Box sx={{ px: 2 }}>
                <Slider
                  value={installmentsCount}
                  onChange={(_, val) => setInstallmentsCount(val as number)}
                  min={1}
                  max={24}
                  step={1}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 4, label: "4" },
                    { value: 8, label: "8" },
                    { value: 12, label: "12 (6m)" },
                    { value: 18, label: "18" },
                    { value: 24, label: "24 (1 año)" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              {parsedAmount > 0 && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  sx={{
                    pt: 1,
                    borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
                  }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Descuento estimado por quincena (días 15 y fin de mes):
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {numeral(installmentAmountApprox).format("$0,0.00")}{" "}
                      <Typography component="span" variant="caption" color="text.secondary">
                        / quincena
                      </Typography>
                    </Typography>
                  </Box>

                  {schedulePreview.length > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setPreviewOpen(!previewOpen)}
                      endIcon={previewOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    >
                      {previewOpen ? "Ocultar desglose" : "Ver calendario de fechas"}
                    </Button>
                  )}
                </Stack>
              )}

              {/* Desglose colapsable de las fechas de corte */}
              {previewOpen && schedulePreview.length > 0 && (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 220, mt: 1 }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell># Cuota</TableCell>
                        <TableCell>Corte Quincenal (15 / Fin de Mes)</TableCell>
                        <TableCell align="right">Monto a Descontar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedulePreview.map((item) => (
                        <TableRow key={item.installmentNumber}>
                          <TableCell>
                            Quincena {item.installmentNumber} de{" "}
                            {item.totalInstallments}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Calendar size={14} opacity={0.6} />
                              <Typography variant="body2" fontWeight={600}>
                                {item.formattedDate}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {numeral(item.amount).format("$0,0.00")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </Paper>

          {/* Evidencia: Dropzone PDF o Imagen */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Evidencia de respaldo (PDF o Imagen - Opcional)
              </Typography>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp,image/jpg"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <Button
                  variant="outlined"
                  startIcon={<Upload size={18} />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    py: 2,
                    borderStyle: "dashed",
                    borderRadius: 2,
                  }}
                >
                  Adjuntar archivo (PDF, JPG, PNG)
                </Button>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    borderColor: alpha(theme.palette.success.main, 0.3),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    {selectedFile.type.includes("pdf") ? (
                      <FileText size={22} color={theme.palette.error.main} />
                    ) : (
                      <ImageIcon size={22} color={theme.palette.info.main} />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 380 }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleRemoveFile}
                    title="Eliminar evidencia"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Paper>
              )}
            </Stack>
          </Paper>

          {/* Notas */}
          <FormTextField
            label="Notas / Observaciones adicionales"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Comentarios sobre el acuerdo de pago o detalles del descuento..."
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !selectedDebtor || parsedAmount <= 0}
          startIcon={
            submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <FileCheck size={18} />
            )
          }
        >
          {submitting ? "Guardando..." : "Guardar Gasto y Generar Quincenas"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
