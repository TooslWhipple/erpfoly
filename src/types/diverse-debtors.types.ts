export interface DiverseDebtorResponsible {
  id: number;
  userId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface DiverseDebtorListItem {
  id: number;
  employeeNumber: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string | null;
  fullName: string;
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
  responsibleUserIds: number[];
  status?: "ACTIVE" | "INACTIVE";
}

export type UpdateDiverseDebtorPayload = Partial<CreateDiverseDebtorPayload>;

export interface ListDiverseDebtorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

