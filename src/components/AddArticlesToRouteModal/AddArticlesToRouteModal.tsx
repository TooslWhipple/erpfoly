"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
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
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  SmartToy as RobotIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { SideModal } from "@/components";
import { LogisticZoneBadge } from "@/components/LogisticZoneBadge";
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
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
  TabsRow,
  TabButton,
  SuggestedCard,
  SuggestedHeader,
  ModalContent,
  ZoneGroupsContainer,
  ZoneAccordion,
  ZoneAccordionSummary,
} from "./styles";
import { groupItemsByZone, matchesOrderSearch, zoneGroupKey } from "./zone-groups";

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

function toggleId(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function toggleIds(current: Set<string>, ids: string[], selected: boolean): Set<string> {
  const next = new Set(current);
  for (const id of ids) {
    if (selected) next.add(id);
    else next.delete(id);
  }
  return next;
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
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
  const [selectedRecoveryIds, setSelectedRecoveryIds] = useState<Set<string>>(new Set());
  const [selectedScheduledIds, setSelectedScheduledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const openSessionKey = open ? `${routeId}:${branchId ?? ""}` : null;
  const [resetKey, setResetKey] = useState<string | null>(null);

  if (openSessionKey !== resetKey) {
    setResetKey(openSessionKey);
    if (openSessionKey) {
      setActiveTab("orders");
      setSelectedArticleIds(new Set());
      setSelectedRecoveryIds(new Set());
      setSelectedScheduledIds(new Set());
      setSearchQuery("");
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    fetchAvailableOrders(routeId, undefined, branchId ?? undefined)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData({
          suggested: [],
          orders: [],
          recoveries: [],
          suggestedCount: 0,
          ordersCount: 0,
          recoveriesCount: 0,
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, routeId, branchId, fetchAvailableOrders]);

  const articleItems = useMemo(
    () => [...data.suggested, ...data.orders],
    [data.suggested, data.orders],
  );

  const filteredArticles = useMemo(
    () => articleItems.filter((item) => matchesOrderSearch(item, searchQuery)),
    [articleItems, searchQuery],
  );

  const filteredScheduledItems = useMemo(
    () => articleItems.filter((item) => matchesOrderSearch(item, searchQuery)),
    [articleItems, searchQuery],
  );

  const filteredRecoveries = useMemo(
    () => data.recoveries.filter((item) => matchesOrderSearch(item, searchQuery)),
    [data.recoveries, searchQuery],
  );

  const anchorItem = useMemo(() => {
    for (const id of selectedArticleIds) {
      const item = articleItems.find((candidate) => candidate.id === id);
      if (item) return item;
    }
    return null;
  }, [selectedArticleIds, articleItems]);

  const zoneSuggestions = useMemo(() => {
    if (!anchorItem) return [];
    const anchorKey = zoneGroupKey(anchorItem);
    return articleItems.filter(
      (item) =>
        zoneGroupKey(item) === anchorKey && !selectedArticleIds.has(item.id),
    );
  }, [anchorItem, articleItems, selectedArticleIds]);

  const filteredZoneSuggestions = useMemo(
    () => zoneSuggestions.filter((item) => matchesOrderSearch(item, searchQuery)),
    [zoneSuggestions, searchQuery],
  );

  const selectionCount = isScheduled
    ? selectedScheduledIds.size
    : selectedArticleIds.size + selectedRecoveryIds.size;

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleToggleArticle = (id: string) => {
    setSelectedArticleIds((prev) => toggleId(prev, id));
  };

  const handleToggleArticleGroup = (ids: string[], selected: boolean) => {
    setSelectedArticleIds((prev) => toggleIds(prev, ids, selected));
  };

  const handleToggleScheduled = (id: string) => {
    setSelectedScheduledIds((prev) => toggleId(prev, id));
  };

  const handleToggleScheduledGroup = (ids: string[], selected: boolean) => {
    setSelectedScheduledIds((prev) => toggleIds(prev, ids, selected));
  };

  const handleToggleRecovery = (id: string) => {
    setSelectedRecoveryIds((prev) => toggleId(prev, id));
  };

  const handleToggleRecoveryGroup = (ids: string[], selected: boolean) => {
    setSelectedRecoveryIds((prev) => toggleIds(prev, ids, selected));
  };

  const handleConfirm = async () => {
    if (selectionCount === 0) return;
    setSubmitting(true);
    try {
      let points: AddRoutePointPayload[];
      if (isScheduled) {
        points = buildPointsFromSelected(articleItems, selectedScheduledIds);
      } else {
        const pointsMap = new Map<string, AddRoutePointPayload>();
        for (const point of [
          ...buildPointsPayload(
            data.suggested,
            data.orders,
            selectedArticleIds,
            selectedArticleIds,
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

  const renderItemRows = (
    rows: SelectableItem[],
    selectedIds: Set<string>,
    onToggle: (id: string) => void,
    dateHeader: string,
  ) => (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell padding="checkbox" sx={{ minWidth: "48px" }} />
            <StyledTableCell sx={{ minWidth: "112px" }}>Pedido</StyledTableCell>
            <StyledTableCell sx={{ minWidth: "140px" }}>SKU</StyledTableCell>
            <StyledTableCell sx={{ minWidth: "240px" }}>Artículo</StyledTableCell>
            <StyledTableCell sx={{ minWidth: "160px" }}>Zona</StyledTableCell>
            <StyledTableCell sx={{ minWidth: "160px" }}>{dateHeader}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const isSelected = selectedIds.has(row.id);
            return (
              <StyledTableRow key={row.id} selected={isSelected} hover>
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggle(row.id)}
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
                <StyledTableCell>
                  <LogisticZoneBadge label={row.zone} color={row.zoneColor} />
                </StyledTableCell>
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

  const renderZoneGroups = (
    items: SelectableItem[],
    selectedIds: Set<string>,
    onToggle: (id: string) => void,
    onToggleGroup: (ids: string[], selected: boolean) => void,
    dateHeader: string,
    emptyMessage: string,
  ) => {
    if (loading) {
      return (
        <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
          <CircularProgress size={32} />
        </Stack>
      );
    }

    if (items.length === 0) {
      return (
        <EmptyStateContainer>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </EmptyStateContainer>
      );
    }

    const groups = groupItemsByZone(items);

    return (
      <ZoneGroupsContainer>
        {groups.map((group) => {
          const groupIds = group.items.map((item) => item.id);
          const selectedInGroup = groupIds.filter((id) => selectedIds.has(id)).length;
          const allSelected = selectedInGroup === groupIds.length;
          const someSelected = selectedInGroup > 0 && !allSelected;

          return (
            <ZoneAccordion key={group.key} defaultExpanded disableGutters>
              <ZoneAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={submitting}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onToggleGroup(groupIds, !allSelected)}
                />
                <LogisticZoneBadge label={group.label} color={group.color} />
                <Typography variant="body2" color="text.secondary">
                  {group.items.length}
                </Typography>
              </ZoneAccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {renderItemRows(group.items, selectedIds, onToggle, dateHeader)}
              </AccordionDetails>
            </ZoneAccordion>
          );
        })}
      </ZoneGroupsContainer>
    );
  };

  const renderSuggestedTable = () => {
    if (loading && articleItems.length === 0) {
      return (
        <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
          <CircularProgress size={28} />
        </Stack>
      );
    }

    if (!anchorItem) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Selecciona un artículo para ver más pedidos de la misma zona
        </Typography>
      );
    }

    if (filteredZoneSuggestions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No hay más pedidos pendientes en esta zona
        </Typography>
      );
    }

    return renderItemRows(
      filteredZoneSuggestions,
      selectedArticleIds,
      handleToggleArticle,
      "Fecha de entrega",
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
      maxWidth="xl"
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
              ? "Buscar por número de pedido o zona"
              : "Buscar por pedido, SKU, artículo o zona"
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
          renderZoneGroups(
            filteredScheduledItems,
            selectedScheduledIds,
            handleToggleScheduled,
            handleToggleScheduledGroup,
            "Fecha programada",
            searchQuery
              ? "No se encontraron pedidos"
              : "No hay pedidos internos disponibles para agregar",
          )
        ) : (
          <>
            <TabsRow>
              <TabButton
                type="button"
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}>
                {`Artículos [${data.ordersCount + data.suggestedCount}]`}
              </TabButton>
              <TabButton
                type="button"
                active={activeTab === "recoveries"}
                onClick={() => setActiveTab("recoveries")}>
                {`Recuperaciones [${data.recoveriesCount}]`}
              </TabButton>
            </TabsRow>

            {
              (activeTab === "orders") ?
                <Stack spacing={0} flex={1} minHeight={0}>
                  <SuggestedCard variant="outlined">
                    <SuggestedHeader>
                      <RobotIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                      <Typography variant="subtitle2" color="primary.main" fontWeight={600}>Pedidos sugeridos</Typography>
                    </SuggestedHeader>
                    {
                      renderSuggestedTable()
                    }
                  </SuggestedCard>
                  {
                    renderZoneGroups(
                      filteredArticles,
                      selectedArticleIds,
                      handleToggleArticle,
                      handleToggleArticleGroup,
                      "Fecha de entrega",
                      searchQuery
                        ? "No se encontraron pedidos"
                        : "No hay ventas disponibles para agregar",
                    )
                  }
                </Stack>
                :
                renderZoneGroups(
                  filteredRecoveries,
                  selectedRecoveryIds,
                  handleToggleRecovery,
                  handleToggleRecoveryGroup,
                  "Intento fallido",
                  searchQuery
                    ? "No se encontraron recuperaciones"
                    : "No hay artículos pendientes de reasignación",
                )
            }
          </>
        )}
      </ModalContent>
    </SideModal>
  );
}

/** @deprecated Use AddOrdersToRouteModal */
export const AddArticlesToRouteModal = AddOrdersToRouteModal;
