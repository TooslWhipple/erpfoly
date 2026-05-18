import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { MainLayout, StatusChip } from "@/components";
import { Monitor } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { CASH_REGISTERS_UPDATE } from "@/lib/permissions";
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

export default function Cajas() {
  const { hasPermission } = usePermissions();
  const canUpdateCashRegister = hasPermission(CASH_REGISTERS_UPDATE);

  const [cashRegister, setCashRegister] = useState<CashRegisterState>({
    id: "1",
    name: "Caja 1",
    status: "closed",
    initialFund: 1500.0,
    exchangeRate: 17.6,
    currentCash: 1500.0,
    limit: 20000.0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [cutModalOpen, setCutModalOpen] = useState(false);
  const [cashWithdrawalModalOpen, setCashWithdrawalModalOpen] = useState(false);

  const handleOpenCashRegister = () => {
    setCashRegister((prev) => ({
      ...prev,
      status: "open",
    }));
  };

  const handleInitialFundChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCashRegister((prev) => ({
      ...prev,
      initialFund: numValue,
      currentCash: numValue,
    }));
  };

  const handleExchangeRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCashRegister((prev) => ({
      ...prev,
      exchangeRate: numValue,
    }));
  };

  const getStatusLabel = (status: CashRegisterStatus) => {
    return status === "open" ? "Abierta" : "Cerrada";
  };

  const handleCut = () => {
    setCutModalOpen(true);
  };

  const handleCutConfirm = (cutType: CutType, withdrawalData?: Record<number, number>) => {
    // TODO: Implement cut functionality with cutType
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
    // TODO: Implement cash withdrawal functionality
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
              initialFund={cashRegister.initialFund}
              exchangeRate={cashRegister.exchangeRate}
              canOpen={canUpdateCashRegister}
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
