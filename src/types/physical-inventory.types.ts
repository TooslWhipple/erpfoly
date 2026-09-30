export type PhysicalInventoryCaptureMethod = "device_camera";

export type HasVarianceFilter = "all" | "with" | "without";

export interface PhysicalInventoryListItem {
  id: number;
  date: string;
  branch: { id: number; name: string };
  totalProducts: number;
  totalItems: number;
  missingUnits: number;
  surplusUnits: number;
  responsibleUser: string;
}

export interface PhysicalInventoryItem {
  id?: number;
  productId: number;
  code: string;
  name: string;
  categoryPath?: string;
  systemQuantity: number;
  /** -1 = sin revisar; 0+ = conteo real comparado contra existencia */
  countedQuantity: number;
  wasScanned: boolean;
  isSurplus: boolean;
}

export interface PhysicalInventoryDetail {
  id: number;
  branch: { id: number; name: string };
  capturedAt: string;
  captureMethod: PhysicalInventoryCaptureMethod;
  totalProducts: number;
  totalItems: number;
  missingUnits: number;
  surplusUnits: number;
  responsibleUser: string;
  responsibleUserId: number | null;
  items: PhysicalInventoryItem[];
}

export interface PhysicalInventoryBranchProduct {
  productId: number;
  code: string;
  name: string;
  department: string;
  line: string;
  categoryPath: string;
  systemQuantity: number;
  description?: string | null;
  supplierName?: string;
  imageUrl?: string | null;
}

export interface PhysicalInventoryLastScannedProduct {
  productId: number;
  code: string;
  name: string;
  description: string | null;
  supplierName: string;
  department: string;
  line: string;
  imageUrl: string | null;
  isSurplus: boolean;
}

export interface PhysicalInventoryBranchProductsResponse {
  branch: { id: number; name: string };
  rows: PhysicalInventoryBranchProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePhysicalInventoryPayload {
  branchId: number;
  captureMethod: PhysicalInventoryCaptureMethod;
  capturedAt: string;
  items: Array<{
    productId: number;
    systemQuantity: number;
    countedQuantity: number;
    wasScanned: boolean;
    isSurplus: boolean;
  }>;
}

export interface PhysicalInventoryScanDraft {
  branchId: number;
  branchName: string;
  captureMethod: PhysicalInventoryCaptureMethod;
  capturedAt: string;
  responsibleUser: string;
  items: PhysicalInventoryItem[];
}

export interface PhysicalInventorySummary {
  totalProducts: number;
  totalItems: number;
  missingUnits: number;
  surplusUnits: number;
  missingItems: PhysicalInventoryItem[];
  surplusItems: PhysicalInventoryItem[];
  scannedItems: PhysicalInventoryItem[];
}

export const PHYSICAL_INVENTORY_CAPTURE_METHOD_LABELS: Record<
  PhysicalInventoryCaptureMethod,
  string
> = {
  device_camera: "Cámara del dispositivo",
};

export const PHYSICAL_INVENTORY_DRAFT_KEY = "physicalInventoryDraft";

/** Valor inicial: producto aún no revisado */
export const PHYSICAL_INVENTORY_UNREVIEWED = -1;

export const PHYSICAL_INVENTORY_PAGE_SIZE = 50;
