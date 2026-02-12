import type {
  DiscountRequest,
  GetDiscountRequestsParams,
  GetDiscountRequestsResponse,
} from "@/types/discount-requests.types";

// ============================================================================
// MOCK DATA - Realistic discount requests for development
// ============================================================================

const MOCK_REQUESTS: DiscountRequest[] = [
  {
    id: 123456,
    createdAt: "2025-12-01T09:48:00",
    type: "contado",
    customerName: "María Carmen Fuentes López",
    articleCount: 1,
    amount: 12560.4,
    reason: "Última pieza",
    status: "pending",
  },
  {
    id: 123457,
    createdAt: "2025-12-01T09:48:00",
    type: "credito",
    customerName: "José López Vázquez",
    articleCount: 2,
    amount: 28450.0,
    reason: "Cierre de venta",
    status: "pending",
  },
  {
    id: 123458,
    createdAt: "2025-12-01T10:15:00",
    type: "contado",
    customerName: "Diego Hernández García",
    articleCount: 1,
    amount: 5600.0,
    reason: "Pieza dañada o con desperfecto",
    status: "pending",
  },
  {
    id: 123459,
    createdAt: "2025-12-01T11:22:00",
    type: "credito",
    customerName: "Lucía Pérez Morales",
    articleCount: 3,
    amount: 42100.5,
    reason: "Cierre de venta",
    status: "pending",
  },
  {
    id: 123460,
    createdAt: "2025-11-30T14:30:00",
    type: "contado",
    customerName: "Ana Martínez Ruiz",
    articleCount: 1,
    amount: 8900.0,
    reason: "Última pieza",
    status: "accepted",
  },
  {
    id: 123461,
    createdAt: "2025-11-30T16:45:00",
    type: "credito",
    customerName: "Carlos Sánchez Mendoza",
    articleCount: 2,
    amount: 15600.0,
    reason: "Pieza dañada o con desperfecto",
    status: "accepted",
  },
  {
    id: 123462,
    createdAt: "2025-11-29T09:10:00",
    type: "contado",
    customerName: "Roberto González Castro",
    articleCount: 1,
    amount: 3200.0,
    reason: "Cierre de venta",
    status: "rejected",
  },
  {
    id: 123463,
    createdAt: "2025-11-28T17:00:00",
    type: "credito",
    customerName: "Patricia Ramírez Soto",
    articleCount: 4,
    amount: 67800.0,
    reason: "Última pieza",
    status: "rejected",
  },
];

// ============================================================================
// MOCK API
// ============================================================================

/**
 * Fetches discount requests with optional status filter and search.
 * In production, this would call the actual API.
 */
export async function getDiscountRequests(
  params: GetDiscountRequestsParams
): Promise<GetDiscountRequestsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...MOCK_REQUESTS];

  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status);
  }

  if (params.search?.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        String(r.id).includes(q) ||
        r.reason.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = params.page * params.limit;
  const end = start + params.limit;
  const data = filtered.slice(start, end);

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}
