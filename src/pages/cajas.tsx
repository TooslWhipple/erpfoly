import { useState, useEffect, useCallback, useMemo } from "react";
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
  createWithdrawal,
  createPartialCut,
  createFinalCut,
  getSessionHistory,
  getSessionSummary,
  type CashMovement,
} from "@/services/cash-register.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const MOVEMENT_TYPE_MAP: Record<string, string> = {
  PAYMENT: "Abono",
  PARTIAL_CUT: "Corte parcial",
  FINAL_CUT: "Corte final",
  WITHDRAWAL: "Retiro de efectivo",
};

export default function Cajas() {
  const { hasPermission } = usePermissions();
  const canUpdateCashRegister = hasPermission(CASH_REGISTERS_UPDATE);
  const user = useAuthStore((state) => state.user);
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);

  const [cashRegister, setCashRegister] = useState<CashRegisterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isCutting, setIsCutting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [cutModalOpen, setCutModalOpen] = useState(false);
  const [cashWithdrawalModalOpen, setCashWithdrawalModalOpen] = useState(false);

  const [initialFund, setInitialFund] = useState("1500");
  const [exchangeRate, setExchangeRate] = useState("17.6");

  const [movements, setMovements] = useState<CashMovement[]>([]);

  const cutModalData = useMemo(() => {
    const withdrawals = movements.filter(
      (m) => m.movement_type === "WITHDRAWAL"
    );
    const payments = movements.filter(
      (m) => m.movement_type === "PAYMENT"
    );
    const partialCuts = movements.filter(
      (m) => m.movement_type === "PARTIAL_CUT"
    );

    const withdrawalCount = withdrawals.length;
    const withdrawalTotal = withdrawals.reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );
    const partialCutTotal = partialCuts.reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );
    const totalIncome = payments.reduce(
      (sum, m) => sum + Number(m.amount),
      0
    );

    const totalWithdrawals = withdrawalTotal + partialCutTotal;
    const expectedCash =
      (cashRegister?.initialFund ?? 0) + totalIncome - totalWithdrawals;
    const actualCash = cashRegister?.currentCash ?? 0;
    const shortage = expectedCash - actualCash;

    return {
      cash: actualCash,
      creditCard: 0,
      cashDeposits: 0,
      withdrawals: withdrawalCount,
      withdrawalAmount: totalWithdrawals,
      totalIncome,
      shortage,
    };
  }, [movements, cashRegister]);

  const loadAssignedCashRegister = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const summary = await getSessionSummary();
      if (!summary) {
        showError("No tienes una caja asignada. Contacta a un administrador.");
        return;
      }
      setCashRegister({
        id: String(summary.cash_register_id),
        name: summary.cash_register_name,
        status: summary.status === "OPEN" ? "open" : "closed",
        initialFund: summary.opening_balance ?? 0,
        exchangeRate: summary.exchange_rate ?? 17.6,
        currentCash: summary.current_cash ?? 0,
        limit: summary.limit ?? 20000,
      });
      if (summary.status === "CLOSED") {
        setInitialFund("1500");
        setExchangeRate("17.6");
      }
      if (summary.status === "OPEN") {
        await loadMovements();
      }
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, showError]);

  const loadMovements = useCallback(async () => {
    try {
      const history = await getSessionHistory();
      setMovements(history);
    } catch {
      // Silently fail, history is optional
    }
  }, []);

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
      showSuccess("Caja abierta exitosamente");
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

  const handleCutConfirm = async (cutType: CutType, withdrawalData?: Record<number, number>) => {
    if (!cashRegister) return;
    try {
      setIsCutting(true);
      if (cutType === "partial" && withdrawalData) {
        const denominations = Object.entries(withdrawalData)
          .filter(([, qty]) => qty > 0)
          .map(([denomId, qty]) => ({
            denomination_id: parseInt(denomId, 10),
            quantity: qty,
          }));

        const total = Object.entries(withdrawalData).reduce(
          (sum, [denomId, qty]) => sum + parseInt(denomId, 10) * qty,
          0
        );

        await createPartialCut({
          denominations,
          total_counted: total,
        });
        showSuccess("Corte parcial registrado");
        await loadMovements();
      } else {
        await createFinalCut({
          total_counted: cashRegister.currentCash,
          cash: cashRegister.currentCash,
          credit_card: 0,
          cash_deposits: 0,
          initial_fund: cashRegister.initialFund,
          shortage: 0,
        });
        setCashRegister((prev) =>
          prev ? { ...prev, status: "closed" } : prev
        );
        setInitialFund("1500");
        setExchangeRate("17.6");
        showSuccess("Corte final realizado, caja cerrada");
      }
      setCutModalOpen(false);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsCutting(false);
    }
  };

  const handleWithdrawal = () => {
    setCashWithdrawalModalOpen(true);
  };

  const handleCashWithdrawalConfirm = async (amount: number, bank: string, checkNumber: string) => {
    if (!cashRegister) return;
    try {
      setIsWithdrawing(true);
      await createWithdrawal({
        amount,
        bank,
        check_number: checkNumber || undefined,
      });
      setCashRegister((prev) =>
        prev ? { ...prev, currentCash: prev.currentCash - amount } : prev
      );
      showSuccess("Retiro registrado exitosamente");
      await loadMovements();
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsWithdrawing(false);
    }
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
              movements={movements}
              movementTypeMap={MOVEMENT_TYPE_MAP}
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
        withdrawalAmount={cutModalData.withdrawalAmount}
        totalIncome={cutModalData.totalIncome}
        shortage={cutModalData.shortage}
        denominations={denominations}
        isLoading={isCutting}
      />

      <CashWithdrawalModal
        open={cashWithdrawalModalOpen}
        onClose={() => setCashWithdrawalModalOpen(false)}
        onConfirm={handleCashWithdrawalConfirm}
        cashRegisterName={cashRegister.name}
        currentCash={cashRegister.currentCash}
        banks={banks}
        isLoading={isWithdrawing}
      />
    </MainLayout>
  );
}
