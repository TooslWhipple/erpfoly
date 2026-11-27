export const DISCONTINUED_CHIP_LABEL = "En liquidación / Descontinuado";
export const DISCONTINUED_SALE_WARNING =
  "Producto en liquidación/descontinuado: No volverá a recibirse";
export const RED_PAPER_PRINT_WARNING =
  "Este artículo está en liquidación. Inserta el rollo de papel ROJO en la impresora antes de imprimir.";

/**
 * Chip for the POS. Liquidation is end of life, so it comes only from
 * `isDiscontinued`, the same flag the catalog, inventory and labels read
 * (FOLY-274).
 */
export function saleLifecycleChipLabel(item: {
  isDiscontinued?: boolean;
}): string | null {
  return item.isDiscontinued ? DISCONTINUED_CHIP_LABEL : null;
}
