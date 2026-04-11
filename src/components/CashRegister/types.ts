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
  initialFund: number;
  exchangeRate: number;
  onInitialFundChange: (value: string) => void;
  onExchangeRateChange: (value: string) => void;
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
