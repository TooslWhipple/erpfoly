/**
 * Service-orders facade. Currently re-exports mocks so callers can later
 * swap to a real API without changing page components.
 */
export {
  canCancelInvoice,
  cancelInvoice,
  createServiceOrder,
  getServiceOrderByArticleId,
  getServiceOrderById,
  updateServiceOrder,
  updateServiceOrderStatus,
  MOCK_AUTHORIZERS,
} from "@/data/atencion-cliente.mockData";
