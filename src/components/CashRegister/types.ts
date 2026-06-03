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

export interface CashMovement {
  id: number;
  amount: number;
  movement_type: string;
  reference_folio: string | null;
  created_at: string;
  created_by_name: string;
  client_name: string | null;
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
  movements?: CashMovement[];
  movementTypeMap?: Record<string, string>;
}
