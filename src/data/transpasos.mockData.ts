import type { TransferArticle, TransferArticleOption } from "@/types/transpasos.types";

const MOCK_ARTICLES: TransferArticle[] = [
  {
    id: "1",
    code: "04ET 12345",
    status: "active",
    name: "Lavadora Mabe 22kg LMH72205WBABO Blanca",
    department: "04 - Línea Blanca",
    line: "LV - Lavadora",
    inStock: 32,
    inTransit: 15,
  },
  {
    id: "2",
    code: "04ET 12345",
    status: "active",
    name: 'Estufa Mabe 30" de Piso EM7654BFIS2/3 Acero Inoxidable',
    department: "04 - Línea Blanca",
    line: "ET - Estufas",
    inStock: 12,
    inTransit: 5,
  },
  {
    id: "3",
    code: "04RF 67890",
    status: "active",
    name: "Refrigerador LG 20 pies cúbicos",
    department: "04 - Línea Blanca",
    line: "RF - Refrigeradores",
    inStock: 8,
    inTransit: 3,
  },
];

const MOCK_OPTIONS: TransferArticleOption[] = [
  { id: "1", code: "04ET 12345", name: "Lavadora Mabe 22kg LMH72205WBABO Blanca", inStock: 32, inTransit: 15 },
  { id: "2", code: "04ET 12345", name: 'Estufa Mabe 30" de Piso EM7654BFIS2/3 Acero Inoxidable', inStock: 12, inTransit: 5 },
  { id: "3", code: "04RF 67890", name: "Refrigerador LG 20 pies cúbicos", inStock: 8, inTransit: 3 },
  { id: "4", code: "04ET 11111", name: "Estufa Mabe 24\" EM2412", inStock: 20, inTransit: 0 },
  { id: "5", code: "04LV 22222", name: "Lavadora Samsung 18kg", inStock: 15, inTransit: 7 },
];

export async function getArticlesForNewTransfer(): Promise<TransferArticle[]> {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_ARTICLES.map((a) => ({ ...a }));
}

export async function getAvailableArticlesToAddToTransfer(
  _transferId?: string,
  search?: string
): Promise<TransferArticleOption[]> {
  await new Promise((r) => setTimeout(r, 300));
  if (!search?.trim()) return [...MOCK_OPTIONS];
  const q = search.toLowerCase();
  return MOCK_OPTIONS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  );
}
