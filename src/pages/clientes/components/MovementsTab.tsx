import { MovementsTable } from "./MovementsTable";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface MovementsTabProps {
  movements: ClientMovementItem[];
  loading: boolean;
}

export function MovementsTab({ movements, loading }: MovementsTabProps) {
  return <MovementsTable movements={movements} loading={loading} />;
}

const MovementsTabPage = () => null;

export default MovementsTabPage;
