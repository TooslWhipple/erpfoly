import { Skeleton, Stack } from "@mui/material";
import { DeliveriesPanel } from "@/styles/catalogos/proveedores-detail.styles";

const DELIVERY_ITEM_SKELETON_COUNT = 3;

function DeliverySectionSkeleton() {
  return (
    <Stack spacing={1.5}>
      <Skeleton variant="text" width="45%" height={24} animation="wave" />
      <Skeleton variant="rounded" width="100%" height={36} animation="wave" />
      {Array.from({ length: DELIVERY_ITEM_SKELETON_COUNT }, (_, index) => (
        <Stack key={index} direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="rounded" width={32} height={32} animation="wave" />
          <Skeleton variant="text" width="70%" height={20} animation="wave" />
          <Skeleton variant="text" width={24} height={20} animation="wave" />
        </Stack>
      ))}
    </Stack>
  );
}

export function SupplierDeliveriesPanelSkeleton() {
  return (
    <DeliveriesPanel>
      <DeliverySectionSkeleton />
      <DeliverySectionSkeleton />
    </DeliveriesPanel>
  );
}
