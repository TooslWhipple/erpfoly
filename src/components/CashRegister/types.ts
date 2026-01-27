import { CashRegisterStatus } from "@/styles/cajas.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CashRegisterState {
  id: string;
  name: string;
  status: CashRegisterStatus;
  initialFund: number;
  exchangeRate: number;
  currentCash: number;
  limit: number;
}

export interface OpenCashRegisterFormProps {
  initialFund: number;
  exchangeRate: number;
  rememberDevice: boolean;
  onInitialFundChange: (value: string) => void;
  onExchangeRateChange: (value: string) => void;
  onRememberDeviceChange: (value: boolean) => void;
  onOpen: () => void;
}

export interface CashRegisterDashboardProps {
  cashRegister: CashRegisterState;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onCut: () => void;
  onWithdrawal: () => void;
  onViewAllHistory: () => void;
}
