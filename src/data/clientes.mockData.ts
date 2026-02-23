// ============================================================================
// MOCK DATA - Client Detail Module
// ============================================================================

import type {
  ClientDetail,
  ClientActivity,
  ClientMovement,
  ActiveCase,
} from "@/types/clientes.types";

const MOCK_ACTIVITIES: ClientActivity[] = [
  {
    id: "1",
    type: "call",
    author: "Ana Barraza",
    date: "17 de Jun",
    time: "11:34",
    description:
      "El cliente mencionó que acude a sucursal a realizar abono el día de mañana",
  },
  {
    id: "2",
    type: "message",
    author: "Sistema",
    date: "15 de Jun",
    time: "09:00",
    description: "Recordatorio de pago por $1,760.00",
    toolName: "SMS",
  },
];

const MOCK_MOVEMENTS: ClientMovement[] = [
  {
    id: "1",
    type: "payment",
    description: "Abono a cuenta",
    invoice: "123456",
    reference: "123456 02/12",
    date: "16 de Ago, 2025",
    amount: 790.83,
  },
  {
    id: "2",
    type: "payment",
    description: "Abono a cuenta",
    invoice: "123456",
    reference: "123456 02/12",
    date: "16 de Jul, 2025",
    amount: 790.83,
  },
  {
    id: "3",
    type: "purchase",
    description: "Enfriador Split Mirage CHF120T 1Ton 110v F/F",
    invoice: "123456",
    reference: "123456 02/12",
    date: "16 de May, 2025",
    amount: 9490.0,
  },
];

const MOCK_ACTIVE_CASES: ActiveCase[] = [
  {
    id: "04-EN-00101",
    status: "ready",
    statusLabel: "Listo para entrega",
    description: "[1] Sofa Cama Gris Venecia",
    orderType: "Orden de servicio",
  },
];

function buildClientDetail(id: string): ClientDetail {
  const creditLine = 15000;
  const creditUsed = 7117.51;
  const creditAvailable = 7882.49;
  return {
    id,
    clientId: "MOMJ113003TY5",
    fullName: "Jose Antonio Montes Molina",
    creditLine,
    creditUsed,
    creditAvailable,
    requiredPayment: 790.83,
    requiredPaymentDate: "17 de Junio, 2024",
    requiredPaymentLabel: "Ayer",
    activities: MOCK_ACTIVITIES,
    movements: MOCK_MOVEMENTS,
    purchases: MOCK_MOVEMENTS.filter((m) => m.type === "purchase"),
    payments: MOCK_MOVEMENTS.filter((m) => m.type === "payment"),
    activeCases: MOCK_ACTIVE_CASES,
  };
}

const CACHE: Record<string, ClientDetail> = {
  "1": buildClientDetail("1"),
  "2": buildClientDetail("2"),
  "3": buildClientDetail("3"),
  "4": buildClientDetail("4"),
  "5": buildClientDetail("5"),
};

/**
 * Fetches client detail by id (simulated API).
 */
export async function getClientDetail(clientId: string): Promise<ClientDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const client = CACHE[clientId] ?? buildClientDetail(clientId);
  return { ...client, id: clientId, clientId: client.clientId };
}
