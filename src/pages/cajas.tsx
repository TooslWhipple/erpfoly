import { useState, useEffect, useCallback } from "react";
import { Stack, Typography } from "@mui/material";
import { MainLayout, StatusChip } from "@/components";
import { Monitor } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/useAuthStore";
import { CASH_REGISTERS_UPDATE } from "@/lib/permissions";
import { getApiErrorMessage } from "@/lib/axios";
import {
  OpenCashRegisterForm,
  CashRegisterDashboard,
  CutModal,
  CashWithdrawalModal,
  type CashRegisterState,
  type CutType,
  type Denomination,
} from "@/components/CashRegister";
import {
  type CashRegisterStatus,
  CashRegisterIconContainer,
} from "@/styles/cajas.styles";
import {
  getUserAssignedCashRegister,
  openCashRegister as openCashRegisterApi,
} from "@/services/cash-register.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function Cajas() {
  const { hasPermission } = usePermissions();
  const canUpdateCashRegister = hasPermission(CASH_REGISTERS_UPDATE);
  const user = useAuthStore((state) => state.user);
  const showError = useSnackbarStore((state) => state.showError);

  const [cashRegister, setCashRegister] = useState<CashRegisterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [cutModalOpen, setCutModalOpen] = useState(false);
  const [cashWithdrawalModalOpen, setCashWithdrawalModalOpen] = useState(false);

  const [initialFund, setInitialFund] = useState("0");
  const [exchangeRate, setExchangeRate] = useState("17.6");

  const loadAssignedCashRegister = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const assigned = await getUserAssignedCashRegister();
      if (!assigned) {
        showError("No tienes una caja asignada. Contacta a un administrador.");
        return;
      }
      setCashRegister({
        id: String(assigned.id),
        name: assigned.name,
        status: assigned.status === "OPEN" ? "open" : "closed",
        initialFund: 0,
        exchangeRate: 17.6,
        currentCash: 0,
        limit: 20000.0,
      });
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, showError]);

  useEffect(() => {
    loadAssignedCashRegister();
  }, [loadAssignedCashRegister]);

  const handleOpenCashRegister = async () => {
    if (!cashRegister) return;
    try {
      setIsOpening(true);
      await openCashRegisterApi({
        opening_balance: parseFloat(initialFund) || 0,
        exchange_rate: parseFloat(exchangeRate) || 0,
      });
      setCashRegister((prev) =>
        prev
          ? {
              ...prev,
              status: "open",
              initialFund: parseFloat(initialFund) || 0,
              exchangeRate: parseFloat(exchangeRate) || 0,
              currentCash: parseFloat(initialFund) || 0,
            }
          : prev
      );
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsOpening(false);
    }
  };

  const handleInitialFundChange = (value: string) => {
    setInitialFund(value);
  };

  const handleExchangeRateChange = (value: string) => {
    setExchangeRate(value);
  };

  const getStatusLabel = (status: CashRegisterStatus) => {
    return status === "open" ? "Abierta" : "Cerrada";
  };

  const handleCut = () => {
    setCutModalOpen(true);
  };

  const handleCutConfirm = (cutType: CutType, withdrawalData?: Record<number, number>) => {
    if (cutType === "partial" && withdrawalData) {
      // Handle partial cut with withdrawal data
    }
  };

  const cutModalData = {
    cash: 0,
    creditCard: 0,
    cashDeposits: 0,
    withdrawals: 0,
    totalIncome: 0,
    shortage: 0,
  };

  const handleWithdrawal = () => {
    setCashWithdrawalModalOpen(true);
  };

  const handleCashWithdrawalConfirm = (amount: number, bank: string, checkNumber: string) => {
    void amount;
    void bank;
    void checkNumber;
  };

  const banks = [
    { value: "banamex", label: "Banamex" },
    { value: "banorte", label: "Banorte" },
    { value: "hsbc", label: "HSBC" },
    { value: "santander", label: "Santander" },
    { value: "bbva", label: "BBVA" },
  ];

  const denominations: Denomination[] = [
    { value: 100, label: "$100", type: "bill", color: "#F97316" },
    { value: 50, label: "$50", type: "bill", color: "#A855F7" },
    { value: 20, label: "$20", type: "bill", color: "#3B82F6" },
    { value: 10, label: "$10", type: "coin", color: "#EAB308" },
    { value: 5, label: "$5", type: "coin", color: "#EC4899" },
  ];

  const handleViewAllHistory = () => {
    // TODO: Implement view all history functionality
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Stack justifyContent="center" alignItems="center" style={{ marginTop: "112px", minHeight: "200px" }}>
          <Typography variant="body1">Cargando...</Typography>
        </Stack>
      </MainLayout>
    );
  }

  if (!cashRegister) {
    return (
      <MainLayout>
        <Stack justifyContent="center" alignItems="center" style={{ marginTop: "112px", minHeight: "200px" }}>
          <Typography variant="h6" color="text.secondary">
            No tienes una caja asignada
          </Typography>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={3} justifyContent="center" alignItems="center" style={{ marginTop: "112px" }}>
        <Stack
          direction="row"
          spacing={2}
          alignSelf="center"
          alignItems="center">
          <CashRegisterIconContainer>
            <Monitor size={24} />
          </CashRegisterIconContainer>
          <Typography variant="h4">{cashRegister.name}</Typography>
          <StatusChip
            label={getStatusLabel(cashRegister.status)}
            variant={cashRegister.status === "open" ? "success" : "disabled"}
            size="small" />
        </Stack>
        {
          cashRegister.status === "closed" ?
            <OpenCashRegisterForm
              initialFund={initialFund}
              exchangeRate={exchangeRate}
              canOpen={canUpdateCashRegister}
              isLoading={isOpening}
              onInitialFundChange={handleInitialFundChange}
              onExchangeRateChange={handleExchangeRateChange}
              onOpen={handleOpenCashRegister}
            />
            :
            <CashRegisterDashboard
              cashRegister={cashRegister}
              searchQuery={searchQuery}
              canCut={canUpdateCashRegister}
              canWithdraw={canUpdateCashRegister}
              onSearchQueryChange={setSearchQuery}
              onCut={handleCut}
              onWithdrawal={handleWithdrawal}
              onViewAllHistory={handleViewAllHistory}
            />
        }
      </Stack>


      <CutModal
        open={cutModalOpen}
        onClose={() => setCutModalOpen(false)}
        onConfirm={handleCutConfirm}
        cashRegisterName={cashRegister.name}
        initialFund={cashRegister.initialFund}
        currentCash={cashRegister.currentCash}
        cash={cutModalData.cash}
        creditCard={cutModalData.creditCard}
        cashDeposits={cutModalData.cashDeposits}
        withdrawals={cutModalData.withdrawals}
        totalIncome={cutModalData.totalIncome}
        shortage={cutModalData.shortage}
        denominations={denominations}
      />

      <CashWithdrawalModal
        open={cashWithdrawalModalOpen}
        onClose={() => setCashWithdrawalModalOpen(false)}
        onConfirm={handleCashWithdrawalConfirm}
        cashRegisterName={cashRegister.name}
        currentCash={cashRegister.currentCash}
        banks={banks}
      />
    </MainLayout>
  );
}
