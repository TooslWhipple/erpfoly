// ============================================================================
// TYPES & INTERFACES - Client Detail Module
// ============================================================================

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

export interface ClientInfoCategory {
  id: string;
  label: string;
  icon: string;
}
