import type {
  RouteSummary,
  RouteDetail,
  RouteOrder,
  RoutePerson,
  OrderToAdd,
} from "@/types/rutas.types";

export const MOCK_ROUTES_SUMMARY: RouteSummary[] = [
  { id: 1, name: "RUTA 1", status: "scheduled", location: "Altamira Centro", articleCount: 6, pointCount: 6 },
  { id: 2, name: "RUTA 2", status: "scheduled", location: "Altamira Centro", articleCount: 3, pointCount: 3 },
  { id: 3, name: "RUTA 3", status: "scheduled", location: "Altamira Centro", articleCount: 5, pointCount: 4 },
];

const MOCK_ORDERS: RouteOrder[] = [
  {
    id: "1",
    orderId: 193270,
    orderNumber: "193270",
    sequence: 1,
    address: "Villa Bonita 1234, Col. Álamos",
    zone: "1 - Altamira Centro",
    stopType: "delivery",
    items: [
      {
        id: "1",
        articleName: "Lavadora Whirlpool 20kg 8MWT...",
        status: "delivered",
      },
      {
        id: "2",
        articleName: "Sala Dallas Cody Chocolate 2 Piezas...",
        status: "not_delivered",
      },
    ],
  },
  {
    id: "2",
    orderId: 193271,
    orderNumber: "193271",
    sequence: 2,
    address: "Av. Principal 567, Col. Centro",
    zone: "1 - Altamira Centro",
    stopType: "delivery",
    items: [
      {
        id: "3",
        articleName: "Refrigerador Samsung 22 pies",
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    orderId: 193272,
    orderNumber: "193272",
    sequence: 3,
    address: "Calle Secundaria 890",
    zone: "1 - Altamira Centro",
    stopType: "recovery",
    items: [
      {
        id: "4",
        articleName: "Estufa Mabe 4 quemadores",
        status: "pending",
      },
    ],
  },
];

const MOCK_DRIVER: RoutePerson = {
  id: "d1",
  name: "Jorge Arturo Ponce Núñez",
  role: "driver",
};

const MOCK_ASSISTANTS: RoutePerson[] = [
  { id: "a1", name: "Saúl Huerta Duarte", role: "assistant" },
  { id: "a2", name: "Marcelo Iván Nuñez Duarte", role: "assistant" },
];

export function getRouteDetail(id: number): RouteDetail | null {
  const summary = MOCK_ROUTES_SUMMARY.find((r) => r.id === id);
  if (!summary) return null;
  const ordersCount = summary.id === 2 ? 3 : summary.articleCount;
  const pointsCount = summary.id === 2 ? 3 : summary.pointCount;
  return {
    ...summary,
    articleCount: ordersCount,
    pointCount: summary.id === 2 ? 5 : pointsCount,
    driverName: "Jorge Arturo Ponce Núñez",
    vehicleInfo: "Nissan ABC 12 345",
    orders: MOCK_ORDERS.slice(0, Math.min(ordersCount, MOCK_ORDERS.length)),
    driver: MOCK_DRIVER,
    assistants: MOCK_ASSISTANTS,
  };
}

export function getRoutesByDate(_date: Date): Promise<RouteSummary[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_ROUTES_SUMMARY]), 400);
  });
}

export function getRouteDetailById(id: number): Promise<RouteDetail | null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getRouteDetail(id)), 300);
  });
}

const MOCK_ORDERS_TO_ADD: OrderToAdd[] = [
  {
    id: "18563",
    orderNumber: "18563",
    address: "Villa Bonita 1234, Col. Álamos",
    zone: "Altamira",
    articleCount: 1,
  },
  {
    id: "19680",
    orderNumber: "19680",
    address: "Av. Constitución 1500, Col. Centro",
    zone: "Altamira",
    articleCount: 2,
  },
  {
    id: "19800",
    orderNumber: "19800",
    address: "Calle Hidalgo 890, Col. Miramar",
    zone: "Altamira",
    articleCount: 1,
  },
];

export function getAvailableOrdersToAdd(_routeId: number): Promise<OrderToAdd[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_ORDERS_TO_ADD]), 200);
  });
}

/** @deprecated Use getAvailableOrdersToAdd */
export const getAvailableArticlesToAdd = getAvailableOrdersToAdd;
