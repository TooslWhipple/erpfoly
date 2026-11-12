import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { Breadcrumbs, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import {
  ReceiveRecoveryItemModal,
  RecoverySheetClientCard,
  RecoverySheetDetailHeader,
  RecoverySheetDocumentPanel,
  RecoverySheetRouteCard,
  RecoverySheetServiceOrderCard,
  RecoverySheetSummaryBar,
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
    isInvoiceLoading,
    isLoading,
    isSaving,
    isPrinting,
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
    handlePrint,
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
          spacing={2}>
          <Skeleton variant="text" width={280} height={28} />
          <Skeleton variant="rounded" width={140} height={36} />
        </Stack>
        <Stack spacing={1.25}>
          <Skeleton variant="text" width="55%" height={40} />
          <Skeleton variant="rounded" width={260} height={28} sx={{ borderRadius: 999 }} />
        </Stack>
        <Skeleton variant="rounded" height={88} sx={{ borderRadius: 2 }} />
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems="stretch"
        >
          <Stack spacing={2} flex={1}>
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          </Stack>
          <Skeleton
            variant="rounded"
            height={360}
            sx={{ borderRadius: 2, width: { xs: "100%", lg: 340 } }}
          />
        </Stack>
      </Stack>
    );
  }

  if (!detail) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Typography variant="body1" color="text.secondary">Hoja de recuperación no encontrada</Typography>
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
              sx={statusMenuButtonSx}>
              <StatusChip
                size="small"
                label={RECOVERY_SHEET_STATUS_LABELS[detail.status]}
                variant={STATUS_VARIANTS[detail.status]}
              />
            </Button>
          </DetailHeaderActions>
        </DetailToolbarRow>

        <RecoverySheetDetailHeader detail={detail} />

        <RecoverySheetSummaryBar
          detail={detail}
          onInvoiceClick={handleInvoiceClick}
        />

        <ContentLayout>
          <MainColumn>
            {detail.serviceOrder ? (
              <RecoverySheetServiceOrderCard
                serviceOrder={detail.serviceOrder}
                quantity={detail.quantity}
                onOpen={openServiceOrderModal}
              />
            ) : null}

            {detail.scheduledRoute ? (
              <RecoverySheetRouteCard
                route={detail.scheduledRoute}
                onOpen={openRoute}
              />
            ) : null}

            <RecoverySheetClientCard
              customerName={invoice?.customerName}
              customerAddress={invoice?.customerAddress}
              loading={isInvoiceLoading}
            />
          </MainColumn>

          <SideColumn>
            <RecoverySheetDocumentPanel
              sheetId={detail.id}
              folio={detail.folio}
              createdAt={detail.createdAt}
              onDownload={handleDownload}
              onPrint={handlePrint}
              disabled={isSaving}
              isPrinting={isPrinting}
            />
          </SideColumn>
        </ContentLayout>
      </DetailPageStack>

      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}>
        {
          statusMenuOptions.map((status) => (
            <MenuItem
              key={status}
              selected={detail.status === status}
              onClick={() => handleStatusSelect(status)}>
              {RECOVERY_SHEET_STATUS_LABELS[status]}
            </MenuItem>
          ))
        }
      </Menu>

      <ReceiveRecoveryItemModal
        open={receiveModalOpen}
        loading={receiveMutationPending}
        onClose={closeReceiveModal}
        onConfirm={handleReceiveConfirm}
      />

      {
        invoice && detail.serviceOrder &&
        <ServiceOrderDetailModal
          open={serviceOrderModalOpen}
          serviceOrderId={detail.serviceOrder.serviceOrderId}
          invoice={invoice}
          onClose={closeServiceOrderModal}
        />
      }
    </>
  );
}
