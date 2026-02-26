import { Calendar } from "@/components/Icons";
import type { DepartmentLowRotation } from "@/types/liquidaciones.types";
import { Card } from "./styles";
import { Divider, Stack, Typography } from "@mui/material";

export interface DepartmentCardProps {
  department: DepartmentLowRotation;
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  return (
    <Card>
      <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
        <Stack flex={1}>
          <Typography variant="h6" fontWeight={700}>{department.name}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Calendar size={14} />
            <Typography variant="body2" color="text.secondary">{department.description}</Typography>
          </Stack>
        </Stack>
        <Stack flex={1}>
          <Typography variant="body2" color="text.secondary">Lento movimiento</Typography>
          <Typography variant="body1" fontWeight={700}>{department.slowMovement}</Typography>
        </Stack>
        <Stack flex={1}>
          <Typography variant="body2" color="text.secondary">En liquidación</Typography>
          <Typography variant="body1" fontWeight={700}>{department.inLiquidation}</Typography>
        </Stack>
        <Stack flex={1}>
          <Typography variant="body2" color="text.secondary">Inventario total</Typography>
          <Typography variant="body1" fontWeight={700}>{department.totalInventory}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
