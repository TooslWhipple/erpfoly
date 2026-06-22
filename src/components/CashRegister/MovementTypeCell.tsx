import { Stack, Typography } from "@mui/material";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_TYPE_ICON_VARIANT,
  MOVEMENT_TYPE_LABELS,
  isCashMovementType,
  type CashMovementType,
} from "@/lib/cashMovement.constants";

interface MovementTypeCellProps {
  type: string;
}

export function MovementTypeCell({ type }: MovementTypeCellProps) {
  const movementType: CashMovementType = isCashMovementType(type)
    ? type
    : "PAYMENT";
  const color = MOVEMENT_TYPE_COLORS[movementType];
  const label = MOVEMENT_TYPE_LABELS[movementType];
  const iconVariant = MOVEMENT_TYPE_ICON_VARIANT[movementType];
  const Icon = iconVariant === "income" ? ArrowDownRight : ArrowUpRight;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Icon size={16} color={color} strokeWidth={2} />
      <Typography variant="body2" sx={{ color, fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}
