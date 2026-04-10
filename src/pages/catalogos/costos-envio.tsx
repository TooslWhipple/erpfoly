import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { MainLayout } from "@/components";
import {
  PageHeader,
  PageTitle,
  HeaderActions,
  Section,
  BranchList,
  BranchRow,
  ShippingCostInput,
} from "@/styles/catalogos/shipping-costs.styles";
import {
  getBranches,
  updateBranchesShippingPrice,
  UpdateBranchShippingPricePayload,
} from "@/services/branches.service";
import type { BranchShippingCost } from "@/types/shipping-costs.types";

// ============================================================================
// HELPERS
// ============================================================================

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value: number): string {
  return value.toFixed(2);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CostosEnvioPage() {
  const [branches, setBranches] = useState<BranchShippingCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    const result = await getBranches({
      page: 1,
      limit: 500,
    });
    setLoading(false);

    if (result.error) {
      setBranches([]);
      setSnackbar({
        open: true,
        message: "Error al cargar la configuración de costos de envío",
        severity: "error",
      });
      return;
    }

    if (result.data?.rows) {
      const mapped: BranchShippingCost[] = result.data.rows.map((b) => ({
        id: String(b.id),
        name: b.name,
        shippingCost: 0,
      }));
      setBranches(mapped);
    } else {
      setBranches([]);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleCostChange = useCallback((branchId: string, value: number) => {
    const clamped = Math.max(0, value);
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, shippingCost: clamped } : b
      )
    );
  }, []);

  const handleSave = useCallback(async () => {
    const branchesPayload = branches.map((b) => ({
      id: Number(b.id),
      shippingPrice: b.shippingCost,
    }));

    const payload: UpdateBranchShippingPricePayload = {
      branches: branchesPayload,
    };
    
    setSaving(true);
    const result = await updateBranchesShippingPrice(payload);
    setSaving(false);

    if (result.error) {
      setSnackbar({
        open: true,
        message: result.error.message ?? "Error al guardar los costos de envío",
        severity: "error",
      });
      return;
    }

    setSnackbar({
      open: true,
      message: "Cambios guardados correctamente",
      severity: "success",
    });
  }, [branches]);

  const handleViewMap = useCallback(() => {
    // Placeholder: in production would navigate to map view or open modal
    setSnackbar({
      open: true,
      message: "Vista de mapa en desarrollo",
      severity: "info",
    });
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const breadcrumbs = [
    { label: "Catálogos", href: "/catalogos/productos" },
    { label: "Costos de envío" },
  ];

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader>
        <PageTitle>Costos de envío</PageTitle>
        <HeaderActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleViewMap}
          >
            Ver mapa
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Guardar cambios
          </Button>
        </HeaderActions>
      </PageHeader>

      <Section>
        {branches.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay sucursales configuradas.
          </Typography>
        ) : (
          <BranchList>
            <Typography variant='subtitle1'>Configuración de costos de envío</Typography>
            <Typography variant='body2' color='text.secondary'>Define los costos de envío que se aplicarán a las ventas que se realicen por sucursal.</Typography>
            {
              branches.map((branch) => (
                <BranchRow key={branch.id}>
                  <Typography variant='body1'>{branch.name}</Typography>
                  <ShippingCostInput
                    size="small"
                    value={formatCurrency(branch.shippingCost)}
                    onChange={(e) => {
                      const value = parseCurrencyInput(e.target.value);
                      handleCostChange(branch.id, value);
                    }}
                    onBlur={(e) => {
                      const value = parseCurrencyInput(e.target.value);
                      handleCostChange(branch.id, Math.max(0, value));
                    }}
                    inputProps={{
                      inputMode: "decimal",
                      "aria-label": `Costo de envío ${branch.name}`,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </BranchRow>
              ))
            }
          </BranchList>
        )}
      </Section>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
