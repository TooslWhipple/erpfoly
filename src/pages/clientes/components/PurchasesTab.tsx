import { useRouter } from "next/router";
import type { ClientDetail, ClientMovement } from "@/types/clientes.types";
import { MovementsTable } from "./MovementsTable";

export interface PurchasesTabProps {
  client: ClientDetail;
}

export function PurchasesTab({ client }: PurchasesTabProps) {
  const router = useRouter();

  const handlePurchaseClick = (movement: ClientMovement) => {
    router.push(`/clientes/${client.id}/compras/${movement.id}`);
  };

  return (
    <MovementsTable
      movements={client.purchases}
      onRowClick={handlePurchaseClick}
    />
  );
}

const PurchasesTabPage = () => null;

export default PurchasesTabPage;
