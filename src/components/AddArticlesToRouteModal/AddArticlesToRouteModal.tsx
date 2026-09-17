"use client";

import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import {
  Stack,
  Button,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon, SmartToy as RobotIcon } from "@mui/icons-material";
import { SideModal } from "@/components";
import { formatDateOnly } from "@/utils/date";
import { theme } from "@/styles/theme";
import type {
  AddRoutePointPayload,
  AvailableOrdersResponse,
  OrderToAdd,
  RouteType,
  SuggestedItemToAdd,
} from "@/types/rutas.types";
import {
  SearchInput,
  TableContainer,
  GeneralTableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
  TabsRow,
  TabButton,
  SuggestedCard,
  SuggestedHeader,
  ModalContent,
} from "./styles";

type ModalTab = "orders" | "recoveries";
type SelectableItem = SuggestedItemToAdd | OrderToAdd;

export interface AddOrdersToRouteModalProps {
  open: boolean;
  onClose: () => void;
  routeId: number;
  routeType: RouteType;
  branchId?: number | null;
  fetchAvailableOrders: (
    routeId: number,
    search?: string,
    branchId?: number,
  ) => Promise<AvailableOrdersResponse>;
  onConfirm: (payload: { points: AddRoutePointPayload[] }) => void | Promise<void>;
}

/** @deprecated Use AddOrdersToRouteModal */
export type AddArticlesToRouteModalProps = AddOrdersToRouteModalProps;

function buildPointsPayload(
  suggested: SuggestedItemToAdd[],
  orders: OrderToAdd[],
  selectedSuggestedIds: Set<string>,
  selectedOrderIds: Set<string>,
): AddRoutePointPayload[] {
  const pointsMap = new Map<string, AddRoutePointPayload>();

  for (const item of suggested) {
    if (!selectedSuggestedIds.has(item.id)) continue;
    const key = `${item.sourceType}-${item.originId}`;
    const existing = pointsMap.get(key);
    if (existing) {
      existing.item_ids.push(item.itemId);
    } else {
      pointsMap.set(key, {
        origin: item.sourceType,
        origin_id: item.originId,
        item_ids: [item.itemId],
      });
    }
  }

  for (const order of orders) {
    if (!selectedOrderIds.has(order.id)) continue;
    const key = `${order.sourceType}-${order.originId}`;
    const existing = pointsMap.get(key);
    if (existing) {
      existing.item_ids.push(order.itemId);
    } else {
      pointsMap.set(key, {
        origin: order.sourceType,
        origin_id: order.originId,
        item_ids: [order.itemId],
      });
    }
  }

  return Array.from(pointsMap.values());
}

function buildPointsFromSelected(
  items: SelectableItem[],
  selectedIds: Set<string>,
): AddRoutePointPayload[] {
  const pointsMap = new Map<string, AddRoutePointPayload>();
  for (const item of items) {
    if (!selectedIds.has(item.id)) continue;
    const key = `${item.sourceType}-${item.originId}`;
    const existing = pointsMap.get(key);
    if (existing) {
      existing.item_ids.push(item.itemId);
    } else {
      pointsMap.set(key, {
        origin: item.sourceType,
        origin_id: item.originId,
        item_ids: [item.itemId],
      });
    }
  }
  return Array.from(pointsMap.values());
}

export function AddOrdersToRouteModal({
  open,
  onClose,
  routeId,
  routeType,
  branchId = null,
  fetchAvailableOrders,
  onConfirm,
}: AddOrdersToRouteModalProps) {
  const isScheduled = routeType === "scheduled";
  const [data, setData] = useState<AvailableOrdersResponse>({
    suggested: [],
    orders: [],
    recoveries: [],
    suggestedCount: 0,
    ordersCount: 0,
    recoveriesCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("orders");
  const [selectedSuggestedIds, setSelectedSuggestedIds] = useState<Set<string>>(new Set());
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [selectedRecoveryIds, setSelectedRecoveryIds] = useState<Set<string>>(new Set());
  const [selectedScheduledIds, setSelectedScheduledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = useCallback(async (search?: string) => {
    setLoading(true);

    try {
      const result = await fetchAvailableOrders(
        routeId,
        search,
        branchId ?? undefined,
      );
      setData(result);
    } catch {
      setData({
        suggested: [],
        orders: [],
        recoveries: [],
        suggestedCount: 0,
        ordersCount: 0,
        recoveriesCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAvailableOrders, routeId, branchId]);

  useEffect(() => {
    if (!open) return;
    setActiveTab("orders");
    setSelectedSuggestedIds(new Set());
    setSelectedOrderIds(new Set());
    setSelectedRecoveryIds(new Set());
    setSelectedScheduledIds(new Set());
    setSearchQuery("");
    void loadOrders();
  }, [open, routeId, branchId, loadOrders]);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      void loadOrders(searchQuery.trim() || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, open, loadOrders]);

  const allScheduledItems = useMemo(
    () => [...data.suggested, ...data.orders],
    [data.suggested, data.orders],
  );

  const filteredSuggested = useMemo(() => {
    if (!searchQuery.trim()) return data.suggested;
    const query = searchQuery.toLowerCase();
    return data.suggested.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.articleName.toLowerCase().includes(query),
    );
  }, [data.suggested, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return data.orders;
    const query = searchQuery.toLowerCase();
    return data.orders.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.articleName.toLowerCase().includes(query),
    );
  }, [data.orders, searchQuery]);

  const filteredScheduledItems = useMemo(() => {
    if (!searchQuery.trim()) return allScheduledItems;
    const query = searchQuery.toLowerCase();
    return allScheduledItems.filter((item) =>
      item.orderNumber.toLowerCase().includes(query),
    );
  }, [allScheduledItems, searchQuery]);

  const filteredRecoveries = useMemo(() => {
    if (!searchQuery.trim()) return data.recoveries;
    const query = searchQuery.toLowerCase();
    return data.recoveries.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.articleName.toLowerCase().includes(query),
    );
  }, [data.recoveries, searchQuery]);

  const selectionCount = isScheduled
    ? selectedScheduledIds.size
    : selectedSuggestedIds.size +
      selectedOrderIds.size +
      selectedRecoveryIds.size;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleToggleSuggested = (id: string) => {
    setSelectedSuggestedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleOrder = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleScheduled = (id: string) => {
    setSelectedScheduledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleRecovery = (id: string) => {
    setSelectedRecoveryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selectionCount === 0) return;
    setSubmitting(true);
    try {
      let points: AddRoutePointPayload[];
      if (isScheduled) {
        points = buildPointsFromSelected(allScheduledItems, selectedScheduledIds);
      } else {
        const pointsMap = new Map<string, AddRoutePointPayload>();
        for (const point of [
          ...buildPointsPayload(
            data.suggested,
            data.orders,
            selectedSuggestedIds,
            selectedOrderIds,
          ),
          ...buildPointsFromSelected(data.recoveries, selectedRecoveryIds),
        ]) {
          const key = `${point.origin}-${point.origin_id}`;
          const existing = pointsMap.get(key);
          if (existing) {
            existing.item_ids.push(...point.item_ids);
          } else {
            pointsMap.set(key, {
              ...point,
              item_ids: [...point.item_ids],
            });
          }
        }
        points = Array.from(pointsMap.values());
      }
      await onConfirm({ points });
      onClose();
    } catch {
      // Error already shown by the mutation snackbar
    } finally {
      setSubmitting(false);
    }
  };

  const addButtonLabel =
    selectionCount > 0 ? `Agregar [${selectionCount}]` : "Agregar";

  const renderSuggestedTable = () => {
    if (loading) {
      return (
        <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
          <CircularProgress size={28} />
        </Stack>
      );
    }

    if (filteredSuggested.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No hay pedidos sugeridos
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" sx={{ minWidth: "48px" }} />
              <StyledTableCell sx={{ minWidth: "112px" }}>Pedido</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "140px" }}>SKU</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "240px" }}>Artículo</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Zona</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Fecha de entrega</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuggested.map((row) => {
              const isSelected = selectedSuggestedIds.has(row.id);
              return (
                <StyledTableRow key={row.id} selected={isSelected} hover>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleSuggested(row.id)}
                      disabled={submitting}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{row.orderNumber}</StyledTableCell>
                  <StyledTableCell>{row.sku}</StyledTableCell>
                  <StyledTableCell>{row.articleName}</StyledTableCell>
                  <StyledTableCell>{row.zone}</StyledTableCell>
                  <StyledTableCell>
                    {row.scheduledDate
                      ? formatDateOnly(row.scheduledDate, "D [de] MMM YYYY")
                      : "-"}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderGeneralTable = () => {
    if (loading) {
      return (
        <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
          <CircularProgress size={32} />
        </Stack>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <EmptyStateContainer>
          <Typography variant="body2" color="text.secondary">
            {
              (searchQuery)
                ? "No se encontraron pedidos"
                : "No hay ventas disponibles para agregar"
            }
          </Typography>
        </EmptyStateContainer>
      );
    }

    return (
      <GeneralTableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" sx={{ width: 48 }} />
              <StyledTableCell sx={{ minWidth: "112px" }}>Pedido</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "140px" }}>SKU</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "240px" }}>Artículo</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Zona</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Fecha de entrega</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((row) => {
              const isSelected = selectedOrderIds.has(row.id);
              return (
                <StyledTableRow key={row.id} selected={isSelected} hover>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleOrder(row.id)}
                      disabled={submitting}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{row.orderNumber}</StyledTableCell>
                  <StyledTableCell>{row.sku}</StyledTableCell>
                  <StyledTableCell
                    sx={{
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.articleName}
                  </StyledTableCell>
                  <StyledTableCell>{row.zone}</StyledTableCell>
                  <StyledTableCell>
                    {row.scheduledDate
                      ? formatDateOnly(row.scheduledDate, "D [de] MMM YYYY")
                      : "-"}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </GeneralTableContainer>
    );
  };

  const renderRecoveriesTable = () => {
    if (loading) {
      return (
        <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
          <CircularProgress size={32} />
        </Stack>
      );
    }

    if (filteredRecoveries.length === 0) {
      return (
        <EmptyStateContainer>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? "No se encontraron recuperaciones"
              : "No hay artículos pendientes de reasignación"}
          </Typography>
        </EmptyStateContainer>
      );
    }

    return (
      <GeneralTableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" sx={{ width: 48 }} />
              <StyledTableCell sx={{ minWidth: "112px" }}>Pedido</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "140px" }}>SKU</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "240px" }}>Artículo</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Zona</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Intento fallido</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecoveries.map((row) => {
              const isSelected = selectedRecoveryIds.has(row.id);
              return (
                <StyledTableRow key={row.id} selected={isSelected} hover>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleRecovery(row.id)}
                      disabled={submitting}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{row.orderNumber}</StyledTableCell>
                  <StyledTableCell>{row.sku}</StyledTableCell>
                  <StyledTableCell
                    sx={{
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.articleName}
                  </StyledTableCell>
                  <StyledTableCell>{row.zone}</StyledTableCell>
                  <StyledTableCell>
                    {row.scheduledDate
                      ? formatDateOnly(row.scheduledDate, "D [de] MMM YYYY")
                      : "-"}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </GeneralTableContainer>
    );
  };

  const renderScheduledTable = () => {
    if (loading) {
      return (
        <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
          <CircularProgress size={32} />
        </Stack>
      );
    }

    if (filteredScheduledItems.length === 0) {
      return (
        <EmptyStateContainer>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? "No se encontraron pedidos"
              : "No hay pedidos internos disponibles para agregar"}
          </Typography>
        </EmptyStateContainer>
      );
    }

    return (
      <GeneralTableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox" sx={{ width: 48 }} />
              <StyledTableCell sx={{ minWidth: "112px" }}>Pedido</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "140px" }}>SKU</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "240px" }}>Artículo</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Zona</StyledTableCell>
              <StyledTableCell sx={{ minWidth: "160px" }}>Fecha programada</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScheduledItems.map((row) => {
              const isSelected = selectedScheduledIds.has(row.id);
              return (
                <StyledTableRow key={row.id} selected={isSelected} hover>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleScheduled(row.id)}
                      disabled={submitting}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{row.orderNumber}</StyledTableCell>
                  <StyledTableCell>{row.sku}</StyledTableCell>
                  <StyledTableCell
                    sx={{
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.articleName}
                  </StyledTableCell>
                  <StyledTableCell>{row.zone}</StyledTableCell>
                  <StyledTableCell>
                    {row.scheduledDate
                      ? formatDateOnly(row.scheduledDate, "D [de] MMM YYYY")
                      : "-"}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </GeneralTableContainer>
    );
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title={isScheduled ? "Agregar pedidos a esta ruta" : "Agregar artículos a esta ruta"}
      description={
        isScheduled
          ? "Selecciona los pedidos que deseas agregar a esta ruta"
          : "Selecciona los artículos que deseas agregar a esta ruta"
      }
      maxWidth="md"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          sx={{ minWidth: "128px" }}
          disabled={selectionCount === 0 || submitting}>
          {(submitting) ? <CircularProgress size={18} color="inherit" /> : addButtonLabel}
        </Button>
      }
      contentSx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <ModalContent>
        <SearchInput
          placeholder={
            isScheduled
              ? "Buscar por número de pedido"
              : "Buscar por pedido, SKU o artículo"
          }
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          fullWidth
          disabled={loading && data.suggested.length === 0 && data.orders.length === 0}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {isScheduled ? (
          renderScheduledTable()
        ) : (
          <>
            <TabsRow>
              <TabButton
                type="button"
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}
              >
                {`Artículos [${data.ordersCount + data.suggestedCount}]`}
              </TabButton>
              <TabButton
                type="button"
                active={activeTab === "recoveries"}
                onClick={() => setActiveTab("recoveries")}
              >
                {`Recuperaciones [${data.recoveriesCount}]`}
              </TabButton>
            </TabsRow>

            {activeTab === "orders" ? (
              <Stack spacing={0} flex={1} minHeight={0}>
                <SuggestedCard variant="outlined">
                  <SuggestedHeader>
                    <RobotIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                      Pedidos sugeridos
                    </Typography>
                  </SuggestedHeader>
                  {renderSuggestedTable()}
                </SuggestedCard>
                {renderGeneralTable()}
              </Stack>
            ) : (
              renderRecoveriesTable()
            )}
          </>
        )}
      </ModalContent>
    </SideModal>
  );
}

/** @deprecated Use AddOrdersToRouteModal */
export const AddArticlesToRouteModal = AddOrdersToRouteModal;
