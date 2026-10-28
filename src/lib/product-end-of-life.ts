export const DISCONTINUED_CHIP_LABEL = "En liquidación / Descontinuado";
export const LIQUIDATION_CHIP_LABEL = "Liquidación";
export const DISCONTINUED_SALE_WARNING =
  "Producto en liquidación/descontinuado: No volverá a recibirse";

export function saleLifecycleChipLabel(item: {
  isDiscontinued?: boolean;
  isLiquidation?: boolean;
}): string | null {
  if (item.isDiscontinued) return DISCONTINUED_CHIP_LABEL;
  if (item.isLiquidation) return LIQUIDATION_CHIP_LABEL;
  return null;
}
