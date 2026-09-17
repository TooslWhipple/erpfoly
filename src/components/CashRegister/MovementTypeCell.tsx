import { Stack, Typography } from "@mui/material";
import { ArrowDownRight, ArrowUpRight, CircleHelp } from "lucide-react";
import {
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_TYPE_ICON_VARIANT,
  MOVEMENT_TYPE_LABELS,
  isCashMovementType,
} from "@/lib/cashMovement.constants";

interface MovementTypeCellProps {
  type: string;
}

export function MovementTypeCell({ type }: MovementTypeCellProps) {
  const isKnownType = isCashMovementType(type);
  const color = isKnownType ? MOVEMENT_TYPE_COLORS[type] : "#6B7280";
  const label = isKnownType
    ? MOVEMENT_TYPE_LABELS[type]
    : `Movimiento desconocido (${type})`;
  const Icon = isKnownType
    ? MOVEMENT_TYPE_ICON_VARIANT[type] === "income"
      ? ArrowDownRight
      : ArrowUpRight
    : CircleHelp;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
      <Icon size={16} color={color} strokeWidth={2} />
      <Typography variant="body2" noWrap sx={{ color, fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}
