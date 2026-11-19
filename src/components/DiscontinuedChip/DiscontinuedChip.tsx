import { Chip } from "@mui/material";
import { DISCONTINUED_CHIP_LABEL } from "@/lib/product-end-of-life";

export function DiscontinuedChip() {
  return <Chip size="small" color="error" label={DISCONTINUED_CHIP_LABEL} />;
}
