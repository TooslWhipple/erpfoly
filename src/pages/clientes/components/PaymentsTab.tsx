import type { ClientDetail } from "@/types/clientes.types";
import { MovementsTable } from "./MovementsTable";

export interface PaymentsTabProps {
  client: ClientDetail;
}

export function PaymentsTab({ client }: PaymentsTabProps) {
  return <MovementsTable movements={client.payments} />;
}

const PaymentsTabPage = () => null;

export default PaymentsTabPage;
