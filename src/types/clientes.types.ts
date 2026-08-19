export type CollectionActivityTypeCode =
  | "CALL"
  | "MESSAGE"
  | "EMAIL"
  | "VISIT"
  | "NOTE";

export interface ClientCollectionActivityType {
  id: number;
  code: CollectionActivityTypeCode | string;
  name: string;
  description: string | null;
}

export interface ClientCollectionActivity {
  id: number;
  comment: string;
  createdAt: string;
  activityType: ClientCollectionActivityType;
  createdBy: {
    id: number | null;
    name: string;
  };
}

export interface CreateClientCollectionActivityPayload {
  activityTypeId: number;
  comment: string;
}

export type MovementType = "payment" | "purchase";

export interface ClientMovement {
  id: string;
  type: MovementType;
  description: string;
  invoice: string;
  reference: string;
  date: string;
  amount: number;
}

export interface ClientDetailHeader {
  id: number;
  fullName: string;
  curp: string;
  status: ClientStatus | null;
  creditApplicationId: number | null;
  creditLine: {
    authorized: number;
    available: number | null;
    availablePercentage: number | null;
  };
}

export type ClientStatus = "active" | "inactive" | "blocked";

export interface ClientDeactivationReason {
  id: number;
  code: string;
  name: string;
  description: string | null;
  allowsCustomText: boolean;
}

export interface DeactivateClientPayload {
  reasonId: number;
  notes?: string;
}

export type ActivityType = "call" | "message" | "email" | "visit" | "note";

export interface ClientActivity {
  id: string;
  type: ActivityType;
  author: string;
  date: string;
  time: string;
  description: string;
  toolName?: string;
}

/** Legacy list shape used by `clientes.service` / `useClientes`. */
export interface ClientDetail {
  id: string;
  clientId: string;
  fullName: string;
  creditLine: number;
  creditUsed: number;
  creditAvailable: number;
  requiredPayment: number;
  requiredPaymentDate: string;
  requiredPaymentLabel?: string;
  activities: ClientActivity[];
  movements: ClientMovement[];
  purchases: ClientMovement[];
  payments: ClientMovement[];
}

export type GetClientesResponse = ClientDetail[];
