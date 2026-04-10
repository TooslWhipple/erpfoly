import type { ClientDetail } from "@/types/clientes.types";
import { MovementsTable } from "./MovementsTable";

export interface PurchasesTabProps {
  client: ClientDetail;
}

export function PurchasesTab({ client }: PurchasesTabProps) {
  return <MovementsTable movements={client.purchases} />;
}

const PurchasesTabPage = () => null;

export default PurchasesTabPage;
