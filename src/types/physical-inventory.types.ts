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
}

export interface PhysicalInventoryBranchProductsResponse {
  branch: { id: number; name: string };
  products: PhysicalInventoryBranchProduct[];
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
