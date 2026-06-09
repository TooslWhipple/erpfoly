import { MovementsTable } from "./MovementsTable";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface PaymentsTabProps {
  payments: ClientMovementItem[];
  loading: boolean;
}

export function PaymentsTab({ payments, loading }: PaymentsTabProps) {
  return <MovementsTable movements={payments} loading={loading} />;
}

const PaymentsTabPage = () => null;

export default PaymentsTabPage;
