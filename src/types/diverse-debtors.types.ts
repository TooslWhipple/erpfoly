export interface DiverseDebtorResponsible {
  id: number;
  responsibleDebtorId: number;
  employeeNumber: string;
  fullName: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string | null;
  userId: number | null;
  username: string | null;
}

export interface DiverseDebtorListItem {
  id: number;
  employeeNumber: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string | null;
  fullName: string;
  rfc?: string | null;
  clabe?: string | null;
  branchId?: number | null;
  branch?: { id: number; name: string } | null;
  status: "ACTIVE" | "INACTIVE";
  responsibles: DiverseDebtorResponsible[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDiverseDebtorPayload {
  employeeNumber: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname?: string;
  rfc?: string | null;
  clabe?: string | null;
  branchId?: number | null;
  responsibleDebtorIds?: number[];
  status?: "ACTIVE" | "INACTIVE";
}

export type UpdateDiverseDebtorPayload = Partial<CreateDiverseDebtorPayload>;

export interface ListDiverseDebtorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}
