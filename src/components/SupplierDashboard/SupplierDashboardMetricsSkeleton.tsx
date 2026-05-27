import { Grid, Skeleton, Stack } from "@mui/material";
import { MetricCard } from "@/styles/catalogos/proveedores-detail.styles";

const METRIC_SKELETON_COUNT = 3;

export function SupplierDashboardMetricsSkeleton() {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {Array.from({ length: METRIC_SKELETON_COUNT }, (_, index) => (
        <Grid key={index} size={{ xs: 12, md: 4 }}>
          <MetricCard>
            <Skeleton variant="rounded" width={48} height={48} animation="wave" />
            <Stack spacing={0.5} width="100%">
              <Skeleton variant="text" animation="wave" />
              <Skeleton variant="text" animation="wave" />
            </Stack>
          </MetricCard>
        </Grid>
      ))}
    </Grid>
  );
}
