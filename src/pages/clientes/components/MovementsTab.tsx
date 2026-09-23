import { useRouter } from "next/router";
import { MovementsTable } from "./MovementsTable";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface MovementsTabProps {
  clientId: number;
  movements: ClientMovementItem[];
  loading: boolean;
}

export function MovementsTab({ clientId, movements, loading }: MovementsTabProps) {
  const router = useRouter();

  return (
    <MovementsTable
      movements={movements}
      loading={loading}
      showReceiptColumn
      onRowClick={(movement) => {
        if (movement.type !== "payment" || !movement.receipt_id) return;
        void router.push(
          `/clientes/${clientId}/abonos/comprobantes/${movement.receipt_id}`,
        );
      }}
    />
  );
}

const MovementsTabPage = () => null;

export default MovementsTabPage;
