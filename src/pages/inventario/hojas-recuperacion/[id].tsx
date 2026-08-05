import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown, MoreVertical } from "lucide-react";
import { Breadcrumbs, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import {
  ReceiveRecoveryItemModal,
  RecoverySheetDetailHeader,
  RecoverySheetDocumentPanel,
  RecoverySheetRouteCard,
  RecoverySheetServiceOrderCard,
  RecoverySheetWarehouseCard,
} from "@/components/RecoverySheets";
import { ServiceOrderDetailModal } from "@/pages/atencion-cliente/components";
import type { RecoverySheetStatus } from "@/types/recovery-sheets.types";
import { RECOVERY_SHEET_STATUS_LABELS } from "@/types/recovery-sheets.types";
import { useRecoverySheetDetail } from "@/hooks/recovery-sheets/useRecoverySheetDetail";
import {
  ContentLayout,
  DetailHeaderActions,
  DetailPageStack,
  DetailToolbarRow,
  MainColumn,
  optionsIconButtonSx,
  SideColumn,
  statusMenuButtonSx,
} from "@/components/RecoverySheets/styles";

const STATUS_VARIANTS: Record<RecoverySheetStatus, StatusChipVariant> = {
  pendiente: "pending",
  programada: "info",
  recuperada: "success",
  cancelada: "default",
};

export default function RecoverySheetDetailPage() {
  const {
    detail,
    invoice,
    isLoading,
    isSaving,
    breadcrumbs,
    statusMenuAnchor,
    statusMenuOptions,
    receiveModalOpen,
    serviceOrderModalOpen,
    setStatusMenuAnchor,
    handleBack,
    handleInvoiceClick,
    handleStatusSelect,
    handleReceiveConfirm,
    handleDownload,
    closeReceiveModal,
    closeServiceOrderModal,
    openServiceOrderModal,
    openRoute,
    receiveMutationPending,
  } = useRecoverySheetDetail();

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Skeleton variant="text" width={280} height={28} />
          <Skeleton variant="rounded" width={140} height={36} />
        </Stack>
        <Stack spacing={1.5}>
          <Skeleton variant="text" width={180} height={20} />
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width="60%" height={36} />
        </Stack>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems="stretch"
        >
          <Stack spacing={2} flex={1}>
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
          </Stack>
          <Skeleton
            variant="rounded"
            height={320}
            sx={{ borderRadius: 2, width: { xs: "100%", lg: 300 } }}
          />
        </Stack>
      </Stack>
    );
  }

  if (!detail) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Typography variant="body1" color="text.secondary">
          Hoja de recuperación no encontrada
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <DetailPageStack>
        <DetailToolbarRow>
          <Breadcrumbs
            items={breadcrumbs}
            showBackButton
            onBack={handleBack}
          />

          <DetailHeaderActions>
            <Button
              variant="text"
              onClick={(event) => setStatusMenuAnchor(event.currentTarget)}
              disabled={isSaving}
              endIcon={<ChevronDown size={14} />}
              sx={statusMenuButtonSx}
            >
              <StatusChip
                label={RECOVERY_SHEET_STATUS_LABELS[detail.status]}
                variant={STATUS_VARIANTS[detail.status]}
              />
            </Button>

            <IconButton
              size="small"
              aria-label="Opciones"
              sx={optionsIconButtonSx}
            >
              <MoreVertical size={18} />
            </IconButton>
          </DetailHeaderActions>
        </DetailToolbarRow>

        <RecoverySheetDetailHeader
          detail={detail}
          onInvoiceClick={handleInvoiceClick}
        />

        <ContentLayout>
          <MainColumn>
            {detail.warehouse ? (
              <RecoverySheetWarehouseCard warehouse={detail.warehouse} />
            ) : null}

            {detail.scheduledRoute ? (
              <RecoverySheetRouteCard
                route={detail.scheduledRoute}
                onOpen={openRoute}
              />
            ) : null}

            {detail.serviceOrder ? (
              <RecoverySheetServiceOrderCard
                serviceOrder={detail.serviceOrder}
                onOpen={openServiceOrderModal}
              />
            ) : null}
          </MainColumn>

          <SideColumn>
            <RecoverySheetDocumentPanel
              onDownload={handleDownload}
              disabled={isSaving}
            />
          </SideColumn>
        </ContentLayout>
      </DetailPageStack>

      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {statusMenuOptions.map((status) => (
          <MenuItem
            key={status}
            selected={detail.status === status}
            onClick={() => handleStatusSelect(status)}
          >
            {RECOVERY_SHEET_STATUS_LABELS[status]}
          </MenuItem>
        ))}
      </Menu>

      <ReceiveRecoveryItemModal
        open={receiveModalOpen}
        loading={receiveMutationPending}
        onClose={closeReceiveModal}
        onConfirm={handleReceiveConfirm}
      />

      {invoice && detail.serviceOrder ? (
        <ServiceOrderDetailModal
          open={serviceOrderModalOpen}
          serviceOrderId={detail.serviceOrder.serviceOrderId}
          invoice={invoice}
          onClose={closeServiceOrderModal}
        />
      ) : null}
    </>
  );
}
