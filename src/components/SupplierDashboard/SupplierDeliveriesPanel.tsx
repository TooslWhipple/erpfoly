import { Stack, Typography } from "@mui/material";
import { WashingMachine } from "lucide-react";
import type { SupplierDeliveryGroup } from "@/types/supplierDashboard.types";
import {
  DeliveriesPanel,
  DeliveryGroupHeader,
  DeliveryItemRow,
  DeliveryProductIcon,
} from "@/styles/catalogos/proveedores-detail.styles";

interface SupplierDeliveriesPanelProps {
  upcomingDeliveries: SupplierDeliveryGroup[];
  recentDeliveries: SupplierDeliveryGroup[];
}

function DeliveryGroupList({ groups }: { groups: SupplierDeliveryGroup[] }) {
  if (groups.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin entregas registradas
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {groups.map((group) => (
        <Stack key={group.id} spacing={0.5}>
          <DeliveryGroupHeader>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {group.dateLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.itemCount} artículos
            </Typography>
          </DeliveryGroupHeader>
          {group.items.map((item) => (
            <DeliveryItemRow key={item.id}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
                <DeliveryProductIcon>
                  <WashingMachine size={16} />
                </DeliveryProductIcon>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {item.productName}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600}>
                {item.quantity}
              </Typography>
            </DeliveryItemRow>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

export function SupplierDeliveriesPanel({
  upcomingDeliveries,
  recentDeliveries,
}: SupplierDeliveriesPanelProps) {
  return (
    <DeliveriesPanel>
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Próximas entregas
        </Typography>
        <DeliveryGroupList groups={upcomingDeliveries} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Entregas recientes
        </Typography>
        <DeliveryGroupList groups={recentDeliveries} />
      </Stack>
    </DeliveriesPanel>
  );
}
