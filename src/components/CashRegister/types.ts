import { CashRegisterStatus } from "@/styles/cajas.styles";

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
  initialFund: string;
  exchangeRate: string;
  canOpen?: boolean;
  isLoading?: boolean;
  onInitialFundChange: (value: string) => void;
  onExchangeRateChange: (value: string) => void;
  onOpen: () => void;
}

export interface CashRegisterDashboardProps {
  cashRegister: CashRegisterState;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  canCut?: boolean;
  canWithdraw?: boolean;
  onCut: () => void;
  onWithdrawal: () => void;
  onViewAllHistory: () => void;
}
