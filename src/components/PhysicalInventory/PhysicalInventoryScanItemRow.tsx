"use client";

import { Stack, Typography } from "@mui/material";
import { CheckCircle2, Clock3 } from "lucide-react";
import QuantityStepper from "@/components/SelectedItemsPanel/QuantityStepper";
import type { PhysicalInventoryItem } from "@/types/physical-inventory.types";
import { theme } from "@/styles/theme";

export interface PhysicalInventoryScanItemRowProps {
  item: PhysicalInventoryItem;
  onChangeQuantity: (productId: number, quantity: number) => void;
}

export function PhysicalInventoryScanItemRow({
  item,
  onChangeQuantity,
}: PhysicalInventoryScanItemRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        py: 1.5,
        px: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {item.wasScanned ? (
        <CheckCircle2 size={18} color={theme.palette.success.main} />
      ) : (
        <Clock3 size={18} color={theme.palette.text.disabled} />
      )}

      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          minWidth: 36,
          height: 28,
          px: 1,
          borderRadius: 1,
          bgcolor: theme.palette.action.hover,
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {item.systemQuantity}
        </Typography>
      </Stack>

      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {item.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.code}
          {item.isSurplus ? " · Sobrante" : ""}
        </Typography>
      </Stack>

      <QuantityStepper
        value={item.countedQuantity}
        onChange={(value) => onChangeQuantity(item.productId, value)}
        min={0}
      />
    </Stack>
  );
}
