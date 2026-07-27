import { CashRegisterStatus } from "@/styles/cajas.styles";
import type { CashMovementType, CashMovementPaymentForm } from "@/lib/cashMovement.constants";
import type { SaleListItem } from "@/types/ventas.types";

export interface CashRegisterState {
  id: string;
  name: string;
  status: CashRegisterStatus;
  initialFund: number;
  exchangeRate: number;
  currentCash: number;
  limit: number;
  branchId: number;
}

export interface CashMovement {
  id: number;
  amount: number;
  movement_type: CashMovementType;
  payment_form?: CashMovementPaymentForm | null;
  payment_form_label?: string;
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

export type ClientPaymentStatus = "overdue" | "current";

export interface ClientSearchResult {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  paymentStatus: ClientPaymentStatus;
  address: string;
}

export type CashSearchMode = "abonos" | "ventas";

export interface CashRegisterSearchBarProps {
  searchQuery: string;
  isSearching?: boolean;
  onSearchQueryChange: (value: string) => void;
  onSearch?: () => void;
  mode: CashSearchMode;
  onModeChange: (mode: CashSearchMode) => void;
}

export interface ClientSearchResultsProps {
  cashRegisterName: string;
  cashRegisterStatusLabel: string;
  cashRegisterStatus: CashRegisterStatus;
  searchQuery: string;
  results: ClientSearchResult[];
  saleResults: SaleListItem[];
  isSearching?: boolean;
  onSearchQueryChange: (value: string) => void;
  onSearch?: () => void;
  onBack: () => void;
  onRowClick: (client: ClientSearchResult) => void;
  onSaleRowClick: (sale: SaleListItem) => void;
  mode: CashSearchMode;
  onModeChange: (mode: CashSearchMode) => void;
}

export interface CashRegisterHistoryProps {
  cashRegisterName: string;
  cashRegisterStatusLabel: string;
  cashRegisterStatus: CashRegisterStatus;
  movements: CashMovement[];
  onBack: () => void;
}

export interface CashRegisterDashboardProps {
  cashRegister: CashRegisterState;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch?: () => void;
  isSearching?: boolean;
  canCut?: boolean;
  canWithdraw?: boolean;
  onCut: () => void;
  onWithdrawal: () => void;
  onViewAllHistory: () => void;
  movements?: CashMovement[];
  mode: CashSearchMode;
  onModeChange: (mode: CashSearchMode) => void;
}
