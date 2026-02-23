import type { ClientDetail } from "@/types/clientes.types";
import { MovementsTable } from "./MovementsTable";

export interface MovementsTabProps {
  client: ClientDetail;
}

export function MovementsTab({ client }: MovementsTabProps) {
  return <MovementsTable movements={client.movements} />;
}
