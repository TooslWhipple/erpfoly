import { useRouter } from "next/router";
import { MovementsTable } from "./MovementsTable";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface PurchasesTabProps {
  purchases: ClientMovementItem[];
  loading: boolean;
}

export function PurchasesTab({ purchases, loading }: PurchasesTabProps) {
  const router = useRouter();
  const clientId = router.query.id as string;

  const handlePurchaseClick = (movement: ClientMovementItem) => {
    router.push(`/clientes/${clientId}/compras/${movement.id}`);
  };

  return (
    <MovementsTable
      movements={purchases}
      loading={loading}
      onRowClick={handlePurchaseClick}
    />
  );
}

const PurchasesTabPage = () => null;

export default PurchasesTabPage;
