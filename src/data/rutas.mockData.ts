import type { RouteSummary, RouteDetail, RouteArticle, RoutePerson } from "@/types/rutas.types";

export const MOCK_ROUTES_SUMMARY: RouteSummary[] = [
  { id: 1, name: "RUTA 1", status: "scheduled", location: "Altamira Centro", articleCount: 6, pointCount: 6 },
  { id: 2, name: "RUTA 2", status: "scheduled", location: "Altamira Centro", articleCount: 3, pointCount: 3 },
  { id: 3, name: "RUTA 3", status: "scheduled", location: "Altamira Centro", articleCount: 5, pointCount: 4 },
];

const MOCK_ARTICLES: RouteArticle[] = [
  {
    id: "1",
    invoiceNumber: "193270",
    status: "pending",
    articleName: "Lavadora Whirlpool 20kg 8MWT...",
    zone: "1- Altamira Centro",
    address: "Villa Bonita 1234, Col. Álam...",
  },
  {
    id: "2",
    invoiceNumber: "193271",
    status: "pending",
    articleName: "Refrigerador Samsung 22 pies",
    zone: "1- Altamira Centro",
    address: "Av. Principal 567, Col. Centro",
  },
  {
    id: "3",
    invoiceNumber: "193272",
    status: "pending",
    articleName: "Estufa Mabe 4 quemadores",
    zone: "1- Altamira Centro",
    address: "Calle Secundaria 890",
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
  const articlesCount = summary.id === 2 ? 3 : summary.articleCount;
  const pointsCount = summary.id === 2 ? 3 : summary.pointCount;
  return {
    ...summary,
    articleCount: articlesCount,
    pointCount: summary.id === 2 ? 5 : pointsCount,
    driverName: "Jorge Arturo Ponce Núñez",
    vehicleInfo: "Nissan ABC 12 345",
    articles: MOCK_ARTICLES.slice(0, articlesCount),
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
