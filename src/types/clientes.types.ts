<<<<<<< Updated upstream
export type CollectionActivityTypeCode =
  | "CALL"
  | "MESSAGE"
  | "EMAIL"
  | "VISIT"
  | "NOTE";
=======
// ============================================================================
// TYPES & INTERFACES - Client List (API)
// ============================================================================

export interface ClienteListItem {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: string | null;
  domicilio: string | null;
  createdAt: string;
}

export interface GetClientesResponse {
  rows: ClienteListItem[];
}

// ============================================================================
// TYPES & INTERFACES - Client Detail Module
// ============================================================================
>>>>>>> Stashed changes

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

export interface ActiveCase {
  id: string;
  status: string;
  statusLabel: string;
  description: string;
  orderType: string;
}

export interface ClientDetailHeader {
  id: number;
  fullName: string;
  curp: string;
  creditLine: {
    authorized: number;
    available: number | null;
    availablePercentage: number | null;
  };
}

export interface ClientDetailView {
  header: ClientDetailHeader;
  movements: ClientMovement[];
  purchases: ClientMovement[];
  payments: ClientMovement[];
  activeCases: ActiveCase[];
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
  activeCases: ActiveCase[];
}

export type GetClientesResponse = ClientDetail[];
