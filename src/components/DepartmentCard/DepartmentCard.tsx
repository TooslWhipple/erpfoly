import type { KeyboardEvent } from "react";
import type { DepartmentLowRotation } from "@/types/liquidaciones.types";
import { Card } from "./styles";
import { Box, Stack, Typography } from "@mui/material";
import { Settings2 } from "lucide-react";
import { theme } from "@/styles/theme";

export interface DepartmentCardProps {
  department: DepartmentLowRotation;
  onClick?: (department: DepartmentLowRotation) => void;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={700}>{value}</Typography>
    </Stack>
  );
}

export function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  const activate = () => onClick?.(department);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? activate : undefined}
      onKeyDown={onKeyDown}
      sx={onClick ? { cursor: "pointer", "&:hover": { borderColor: "primary.main" } } : undefined}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ minWidth: 0 }}
      >
        <Stack flex={{ md: 2 }} sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{department.name}</Typography>
          {department.description ? (
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Settings2 size={12} color={theme.palette.text.secondary} style={{ marginTop: 4, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{department.description}</Typography>
            </Stack>
          ) : null}
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 2,
            flex: { md: 3 },
            minWidth: 0,
            borderLeft: { md: `1px solid ${theme.palette.app.border}` },
            pl: { md: 2 },
          }}
        >
          <Metric label="Lento movimiento" value={department.slowMovement} />
          <Metric label="En liquidación" value={department.inLiquidation} />
          <Metric label="Inventario total" value={department.totalInventory} />
        </Box>
      </Stack>
    </Card>
  );
}
