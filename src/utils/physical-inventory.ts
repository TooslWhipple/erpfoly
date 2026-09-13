import type { PhysicalInventoryItem, PhysicalInventorySummary } from "@/types/physical-inventory.types";

export function computePhysicalInventorySummary(
  items: PhysicalInventoryItem[],
): PhysicalInventorySummary {
  let totalProducts = 0;
  let missingUnits = 0;
  let surplusUnits = 0;
  const missingItems: PhysicalInventoryItem[] = [];
  const surplusItems: PhysicalInventoryItem[] = [];
  const scannedItems: PhysicalInventoryItem[] = [];

  for (const item of items) {
    totalProducts += item.countedQuantity;
    const diff = item.countedQuantity - item.systemQuantity;

    if (diff < 0) {
      missingUnits += -diff;
      missingItems.push({
        ...item,
        countedQuantity: -diff,
      });
    }

    if (diff > 0) {
      surplusUnits += diff;
      surplusItems.push({
        ...item,
        countedQuantity: diff,
      });
    }

    if (item.wasScanned || item.countedQuantity > 0) {
      scannedItems.push(item);
    }
  }

  return {
    totalProducts,
    totalItems: items.length,
    missingUnits,
    surplusUnits,
    missingItems,
    surplusItems,
    scannedItems,
  };
}
