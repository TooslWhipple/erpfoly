import { useCallback, useEffect, useState } from "react";
import dayjs from "@/lib/dayjs";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Breadcrumbs, BranchOrderItemRow, StatusChip } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
  TransferActions,
  TransferDialogs,
  useTransferActionRunner,
  type TransferDialog,
} from "@/components/TransferActions";
import { TransferIncidentsPanel, TransferTimeline } from "@/components/TransferDetail";
import type {
  BranchOrderDetail,
  BranchOrderLineItem,
  ScheduleBranchRequestPayload,
} from "@/types/solicitudes.types";
import type { TransferDetail } from "@/types/transfers.types";
import { authorizeTransfer, getTransfer, scheduleTransfer } from "@/services/transfers.service";
import {
  mapBranchOrderStatus,
  getBranchOrderStatusLabel,
  getBranchOrderStatusVariant,
} from "@/utils/branchRequest";
import { getTransferButtons } from "@/utils/transfers";
import { usePermissions } from "@/hooks/usePermissions";
import { DAMAGED_INVENTORY_CREATE, TRASPASOS_UPDATE } from "@/lib/permissions";
import {
  PageContainer,
  OriginDestinationCard,
  ProductsSection,
  ProductHeaderSection,
} from "@/styles/solicitudes/detalle.styles";
import { theme } from "@/styles/theme";
import { ArrowRight } from "lucide-react";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { formatDate } from "@/utils/date";
const DELIVERY_DATE_REQUIRED_MESSAGE = "Selecciona la fecha de entrega.";
const DELIVERY_DATE_PAST_MESSAGE =
  "La fecha de entrega no puede ser anterior a mañana.";
function formatScheduledDate(value: string | null | undefined): string {
  if (!value) return "";
  return dayjs.utc(value).format("YYYY-MM-DD");
}
function getMinDeliveryDate(): string {
  return dayjs.utc().add(1, "day").format("YYYY-MM-DD");
}
function mapBackendToBranchOrderDetail(
  detail: TransferDetail,
): BranchOrderDetail {
  const items: BranchOrderLineItem[] = detail.order_items.map((item) => ({
    articleId: String(item.id),
    articleName: item.product?.short_name ?? "Sin nombre",
    deliveryDate: formatScheduledDate(item.scheduled_delivery_date),
    scheduledDeliveryDate: item.scheduled_delivery_date
      ? formatScheduledDate(item.scheduled_delivery_date)
      : null,
    quantity: item.requested_quantity,
    orderItemId: item.id,
    productId: item.product?.id ?? 0,
    requestedQuantity: item.requested_quantity,
    deliveredQuantity: item.delivered_quantity,
    shippedQuantity: item.shipped_quantity,
  }));
  return {
    id: detail.id,
    folio: detail.folio,
    createdAt: detail.created_at,
    status: mapBranchOrderStatus(detail.status),
    originId: String(detail.origin_branch?.id ?? ""),
    originLabel: detail.origin_branch?.name ?? "Sin sucursal",
    destinationId: String(detail.branch?.id ?? ""),
    destinationLabel: detail.branch?.name ?? "Sin sucursal",
    items,
  };
}
function formatCreatedDate(isoDate: string): string {
  return formatDate(isoDate, "dateLong");
}
type PageStatus = "loading" | "success" | "empty" | "error" | "submitting";
export default function TraspasoDetallePage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { showSuccess, showError } = useSnackbarStore();
  const { hasPermission } = usePermissions();
  const viewer = {
    canUpdate: hasPermission(TRASPASOS_UPDATE),
    canRegisterDamage: hasPermission(DAMAGED_INVENTORY_CREATE),
  };
  const [dialog, setDialog] = useState<TransferDialog | null>(null);
  const [detail, setDetail] = useState<TransferDetail | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [order, setOrder] = useState<BranchOrderDetail | null>(null);
  const [originalOrder, setOriginalOrder] = useState<BranchOrderDetail | null>(
    null,
  );
  const [deliveryDateErrors, setDeliveryDateErrors] = useState<
    Record<string, string>
  >({});
  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      const transferId = parseInt(id, 10);
      const result =
        Number.isNaN(transferId) || transferId < 1
          ? null
          : await getTransfer(transferId);
      if (result?.data) {
        const data = mapBackendToBranchOrderDetail(result.data);
        setDetail(result.data);
        setOrder(data);
        setOriginalOrder(JSON.parse(JSON.stringify(data)));
        setDeliveryDateErrors({});
        setStatus("success");
      } else {
        setDetail(null);
        setOrder(null);
        setOriginalOrder(null);
        setStatus("empty");
      }
    } catch {
      setStatus("error");
    }
  }, [id]);
  const { run: runTransferAction, busy: authorizing } = useTransferActionRunner(() => {
    void fetchOrder();
  });
  const handleAuthorize = () => {
    if (!id) return;
    const transferId = parseInt(id, 10);
    if (Number.isNaN(transferId) || transferId < 1) return;
    void runTransferAction(
      () => authorizeTransfer(transferId),
      "El traspaso quedó solicitado.",
    );
  };
  useEffect(() => {
    if (id) fetchOrder();
  }, [id, fetchOrder]);
  const handleBack = () => {
    router.push("/traspasos");
  };
  const validateDeliveryDates = (
    items: BranchOrderLineItem[],
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    const minDate = getMinDeliveryDate();
    for (const item of items) {
      if (!item.deliveryDate.trim()) {
        errors[item.articleId] = DELIVERY_DATE_REQUIRED_MESSAGE;
        continue;
      }
      if (item.deliveryDate < minDate) {
        errors[item.articleId] = DELIVERY_DATE_PAST_MESSAGE;
      }
    }
    return errors;
  };
  const handleUpdate = async () => {
    if (!id || !order || !originalOrder) return;
    const errors = validateDeliveryDates(order.items);
    setDeliveryDateErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStatus("submitting");
    try {
      const scheduleChanges = order.items.filter(
        (item, index) =>
          item.deliveryDate !== originalOrder.items[index].deliveryDate,
      );
      if (scheduleChanges.length > 0) {
        const payload: ScheduleBranchRequestPayload = {
          items: order.items.map((item) => ({
            order_item_id: item.orderItemId,
            scheduled_delivery_date: item.deliveryDate,
          })),
        };
        await scheduleTransfer(parseInt(id, 10), payload);
      }
      await fetchOrder();
      showSuccess("Traspaso actualizado correctamente.");
    } catch {
      setStatus("error");
      showError("No se pudo actualizar el traspaso. Intenta de nuevo.");
    } finally {
      setStatus((prev) => (prev === "submitting" ? "success" : prev));
    }
  };
  const handleDeliveryDateChange = (articleId: string, date: string) => {
    const minDate = getMinDeliveryDate();
    if (date && date < minDate) {
      showError(DELIVERY_DATE_PAST_MESSAGE);
      return;
    }
    setOrder((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.articleId === articleId
            ? {
                ...item,
                deliveryDate: date,
              }
            : item,
        ),
      };
    });
    setDeliveryDateErrors((prev) => {
      if (!prev[articleId]) return prev;
      const next = {
        ...prev,
      };
      delete next[articleId];
      return next;
    });
  };
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Traspasos",
      href: "/traspasos",
    },
    {
      label: order?.folio ?? id ?? "",
    },
  ];
  if (status === "loading" && !order) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Stack alignItems="center" justifyContent="center" minHeight={400}>
          <CircularProgress />
        </Stack>
      </Stack>
    );
  }
  if (status === "empty") {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Stack spacing={1} alignItems="center">
          <Typography variant="body1" color="text.secondary">
            No se encontró el traspaso.
          </Typography>
          <Button variant="contained" onClick={handleBack}>
            Volver a traspasos
          </Button>
        </Stack>
      </Stack>
    );
  }
  if (status === "error") {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Stack spacing={1} alignItems="center">
          <Typography variant="body1" color="error">
            Error al cargar el traspaso.
          </Typography>
          <Button variant="contained" onClick={() => id && fetchOrder()}>
            Reintentar
          </Button>
        </Stack>
      </Stack>
    );
  }
  if (!order || !detail) return null;
  const isEditable = getTransferButtons(detail, viewer).schedule;
  const isSubmitting = status === "submitting";
  const minDeliveryDate = getMinDeliveryDate();
  return (
    <>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        justifyContent="space-between"
      >
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {isEditable && (
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Actualizar pedido"
              )}
            </Button>
          )}
          <TransferActions
            detail={detail}
            viewer={viewer}
            onOpenDialog={setDialog}
            onAuthorize={handleAuthorize}
            authorizing={authorizing}
          />
        </Stack>
      </Stack>

      <PageContainer>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Traspaso
            </Typography>
            <Typography variant="h4">Pedido {order.folio}</Typography>
            <Typography variant="body2" color="text.secondary">
              Creado el {formatCreatedDate(order.createdAt)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1">Estatus:</Typography>
            <StatusChip
              size="small"
              label={getBranchOrderStatusLabel(order.status)}
              variant={getBranchOrderStatusVariant(order.status)}
            />
          </Stack>
          {detail.sale && (
            <Typography variant="body2" color="text.secondary">
              Venta:{" "}
              <Link component={NextLink} href={`/ventas/${detail.sale.id}`}>
                {detail.sale.folio}
              </Link>
            </Typography>
          )}
        </Stack>

        <Divider />

        <OriginDestinationCard>
          <Stack flex={1}>
            <Typography variant="subtitle1">{order.originLabel}</Typography>
            <Typography variant="body2" color="text.secondary">
              Origen
            </Typography>
          </Stack>
          <ArrowRight
            size={16}
            strokeWidth={2}
            color={theme.palette.text.secondary}
          />
          <Stack flex={1}>
            <Typography variant="subtitle1">
              {order.destinationLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por recibir
            </Typography>
          </Stack>
        </OriginDestinationCard>

        <ProductsSection>
          <ProductHeaderSection>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              flex="6 0 400px"
            >
              Nombre
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              flex="2 0 240px"
            >
              Fecha de entrega
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              flex="2 0 96px"
              align="center"
            >
              Pedido
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              flex="2 0 96px"
              align="center"
            >
              Enviado
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              flex="2 0 96px"
              align="center"
            >
              Recibido
            </Typography>
          </ProductHeaderSection>
          <Stack>
            {order.items.map((item, index) => (
              <BranchOrderItemRow
                key={item.articleId}
                item={item}
                dateError={deliveryDateErrors[item.articleId]}
                disabled={!isEditable || isSubmitting}
                minDeliveryDate={minDeliveryDate}
                onDeliveryDateChange={handleDeliveryDateChange}
              />
            ))}
          </Stack>
        </ProductsSection>

        <TransferIncidentsPanel
          detail={detail}
          viewer={viewer}
          onOpenDialog={setDialog}
          onRegisterDamage={(incident, line) =>
            router.push({
              pathname: "/inventario/mercancia-danada",
              query: { branch_id: incident.order.branch_id, product_id: line.product.id },
            })
          }
        />

        <TransferTimeline entries={detail.timeline} />
      </PageContainer>

      <TransferDialogs
        detail={detail}
        active={dialog}
        onClose={() => setDialog(null)}
        onChanged={fetchOrder}
      />
    </>
  );
}
