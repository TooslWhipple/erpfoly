import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  Calculator,
  FileCheck2,
  Receipt,
  FileText,
  Sliders,
  ArrowRight,
  Server,
} from "lucide-react";
import { Title } from "@/components";
import { getInvoicingConfig } from "@/services/ventas.service";
import { theme } from "@/styles/theme";

export default function OpcionesContablesPage() {
  const router = useRouter();

  const { data: invoicingConfig, isLoading } = useQuery({
    queryKey: ["invoicingConfig"],
    queryFn: getInvoicingConfig,
  });

  const facturacionConfirmacionVentaEnabled =
    invoicingConfig?.facturacionConfirmacionVentaEnabled ?? true;

  const accountingModules = [
    {
      title: "Prorrateos",
      description: "Cálculo y distribución de porcentajes por sucursales y zonas.",
      path: "/catalogos/prorrateos",
      icon: <Calculator size={22} color={theme.palette.primary.main} />,
    },
    {
      title: "Tipos de Transacción",
      description: "Configuración de cuentas y reglas de afectación de asientos.",
      path: "/catalogos/tipos-transaccion",
      icon: <Receipt size={22} color={theme.palette.secondary.main} />,
    },
    {
      title: "Pólizas Sistema",
      description: "Plantillas de pólizas contables predeterminadas.",
      path: "/catalogos/polizas-sistema",
      icon: <FileCheck2 size={22} color={theme.palette.info.main} />,
    },
    {
      title: "Pólizas Generadas",
      description: "Visor, consulta de movimientos y envío de pólizas generadas.",
      path: "/catalogos/polizas",
      icon: <FileText size={22} color={theme.palette.success.main} />,
    },
  ];

  return (
    <Stack spacing={3}>
      <Title
        title="Opciones Contables"
        description="Estado de facturación en confirmaciones de venta (definido en backend .env) y acceso a catálogos contables."
      />

      {/* Main Setting Display Card */}
      <Card sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  backgroundColor: theme.palette.action.selected,
                  color: theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sliders size={24} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Facturación en Confirmación de Venta (Backend .env)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor controlado por la variable <code>FACTURACION_CONFIRMACION_VENTA</code> en el servidor.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Server size={18} color={theme.palette.text.secondary} />
              <Chip
                label={
                  isLoading
                    ? "Cargando..."
                    : facturacionConfirmacionVentaEnabled
                    ? "ENCENDIDO (Facturación Visible)"
                    : "APAGADO (Facturación Oculta)"
                }
                color={facturacionConfirmacionVentaEnabled ? "success" : "default"}
                variant={facturacionConfirmacionVentaEnabled ? "filled" : "outlined"}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          <Alert severity={facturacionConfirmacionVentaEnabled ? "info" : "warning"} sx={{ borderRadius: 2 }}>
            {facturacionConfirmacionVentaEnabled ? (
              <Typography variant="body2">
                <strong>Estado Backend (FACTURACION_CONFIRMACION_VENTA=true): ENCENDIDO.</strong> La opción/tarjeta de <strong>Facturación (CFDI)</strong> se encuentra <strong>VISIBLE</strong> en ventas confirmadas (`/ventas/[id]`).
              </Typography>
            ) : (
              <Typography variant="body2">
                <strong>Estado Backend (FACTURACION_CONFIRMACION_VENTA=false): APAGADO.</strong> La opción/tarjeta de <strong>Facturación (CFDI)</strong> se encuentra <strong>OCULTA</strong> en ventas confirmadas (`/ventas/[id]`).
              </Typography>
            )}
          </Alert>
        </Stack>
      </Card>

      {/* Access to Accounting Sub-Modules */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ pt: 1 }}>
        Módulos del Catálogo Contable
      </Typography>

      <Grid container spacing={2}>
        {accountingModules.map((mod) => (
          <Grid size={{ xs: 12, sm: 6 }} key={mod.path}>
            <Paper
              onClick={() => router.push(mod.path)}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.app.border}`,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      backgroundColor: theme.palette.action.hover,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {mod.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {mod.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mod.description}
                    </Typography>
                  </Box>
                </Stack>
                <ArrowRight size={20} color={theme.palette.text.secondary} />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
