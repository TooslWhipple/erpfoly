import { useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import {
  BadgeDollarSign,
  CalendarCheck2,
  FileSpreadsheet,
  ListFilter,
  Plus,
  Users,
} from "lucide-react";
import { Title } from "@/components";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { DiverseDebtorDiscountsReportTab } from "@/components/DiverseDebtorExpenses/DiverseDebtorDiscountsReportTab";
import { DiverseDebtorExpensesListTab } from "@/components/DiverseDebtorExpenses/DiverseDebtorExpensesListTab";
import { DiverseDebtorExpenseCreateModal } from "@/components/DiverseDebtorExpenses/DiverseDebtorExpenseCreateModal";

export default function GastosDeudoresDiversosPage() {
  const theme = useTheme();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    showSuccess("Gasto a deudor registrado correctamente con su plan de quincenas.");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Head>
        <title>Gastos Deudores Diversos | ERP Foly</title>
      </Head>

      <Box sx={{ width: "100%", py: 3, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Gastos Deudores Diversos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Control de cobros a colaboradores en 1 a 24 quincenas y confirmación de descuentos de nómina (días 15 y fin de mes).
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus size={20} />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ fontWeight: 700, px: 2.5, py: 1 }}
            >
              Nuevo Gasto a Deudor
            </Button>
          </Stack>

          {/* Navegación por Pestañas */}
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  minHeight: 52,
                  py: 1.5,
                },
              }}
            >
              <Tab
                icon={<CalendarCheck2 size={18} />}
                iconPosition="start"
                label="Reporte de Descuentos Quincenales (15 y Fin de Mes)"
              />
              <Tab
                icon={<ListFilter size={18} />}
                iconPosition="start"
                label="Historial de Gastos a Deudores"
              />
            </Tabs>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {activeTab === 0 && <DiverseDebtorDiscountsReportTab key={`report-${refreshKey}`} />}
              {activeTab === 1 && (
                <DiverseDebtorExpensesListTab
                  key={`list-${refreshKey}`}
                  onRefreshNeeded={() => setRefreshKey((prev) => prev + 1)}
                />
              )}
            </Box>
          </Paper>
        </Stack>

        {/* Modal de Creación */}
        <DiverseDebtorExpenseCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </Box>
    </>
  );
}
