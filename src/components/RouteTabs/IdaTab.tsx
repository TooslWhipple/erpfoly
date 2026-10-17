import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { Check, Clock, MoreVertical, PlusCircle, Trash2, User, X } from "lucide-react";
import type {
  RouteItemAddedBy,
  RouteOrder,
  RouteOrderItem,
  RouteOrderItemStatus,
  RouteScheduledStop,
} from "@/types/rutas.types";
import {
  getBranchesCatalog,
  type BranchCatalogItem,
} from "@/services/branches.service";
import { StatusChip } from "../StatusChip";
import {
  BranchCard,
  BranchEmptyState,
  BranchHeader,
  BranchItemRow,
} from "./IdaTab.styles";

const ITEM_STATUS_LABELS: Record<RouteOrderItemStatus, string> = {
  pending: "Pendiente",
  delivered: "Entregado",
  not_delivered: "No entregado",
};

function ItemStatusIcon({ status }: { status: RouteOrderItemStatus }) {
  const size = 14;
  if (status === "delivered") return <Check size={size} />;
  if (status === "not_delivered") return <X size={size} />;
  return <Clock size={size} />;
}

function formatAddedBy(addedBy: RouteItemAddedBy): string {
  if (addedBy.type === "user" && addedBy.name) {
    return `Agregado por ${addedBy.name}`;
  }
  return "Agregado autom. por sistema";
}

type FlatBranchItem = {
  pointId: string;
  orderNumber: string;
  item: RouteOrderItem;
};

type ItemMenuState = {
  el: HTMLElement;
  pointId: string;
  itemId: string;
  orderNumber: string;
  articleName: string;
} | null;

export interface IdaTabProps {
  municipality: string;
  scheduledStops: RouteScheduledStop[];
  orders: RouteOrder[];
  canEdit: boolean;
  originBranchId: number | null;
  onAddOrdersForBranch: (branchId: number) => void;
  onRequestRemoveStop: (
    stopId: number,
    branchId: number,
    branchName: string,
  ) => void;
  onRequestRemoveItem: (
    pointId: number,
    itemId: number,
    orderNumber: string,
    articleName: string,
  ) => void;
  onAddScheduledStop: (branchId: number, branchName: string) => void;
}

export function IdaTab({
  municipality,
  scheduledStops,
  orders,
  canEdit,
  originBranchId,
  onAddOrdersForBranch,
  onRequestRemoveStop,
  onRequestRemoveItem,
  onAddScheduledStop,
}: IdaTabProps) {
  const [itemMenu, setItemMenu] = useState<ItemMenuState>(null);
  const [addBranchAnchor, setAddBranchAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [branchCatalog, setBranchCatalog] = useState<BranchCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const itemsByBranchId = useMemo(() => {
    const map = new Map<number, FlatBranchItem[]>();

    for (const order of orders) {
      if (order.destinationBranchId == null) continue;
      const list = map.get(order.destinationBranchId) ?? [];
      for (const item of order.items) {
        list.push({
          pointId: order.id,
          orderNumber: order.orderNumber,
          item,
        });
      }
      map.set(order.destinationBranchId, list);
    }
    return map;
  }, [orders]);

  const activeBranchIds = useMemo(
    () => new Set(scheduledStops.map((stop) => stop.branchId)),
    [scheduledStops],
  );

  const availableBranches = useMemo(
    () =>
      branchCatalog.filter(
        (branch) =>
          branch.id !== originBranchId && !activeBranchIds.has(branch.id),
      ),
    [branchCatalog, originBranchId, activeBranchIds],
  );

  useEffect(() => {
    if (!addBranchAnchor) return;

    let cancelled = false;
    setCatalogLoading(true);
    getBranchesCatalog()
      .then((branches) => {
        if (cancelled) return;
        setBranchCatalog(branches);
      })
      .catch(() => {
        if (cancelled) return;
        setBranchCatalog([]);
      })
      .finally(() => {
        if (cancelled) return;
        setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [addBranchAnchor]);

  const closeItemMenu = () => setItemMenu(null);
  const closeAddBranchMenu = () => setAddBranchAnchor(null);

  const handleItemMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    entry: FlatBranchItem,
  ) => {
    setItemMenu({
      el: event.currentTarget,
      pointId: entry.pointId,
      itemId: entry.item.id,
      orderNumber: entry.orderNumber,
      articleName: entry.item.articleName,
    });
  };

  const handleConfirmRemoveItem = () => {
    if (itemMenu) {
      onRequestRemoveItem(
        Number(itemMenu.pointId),
        Number(itemMenu.itemId),
        itemMenu.orderNumber,
        itemMenu.articleName,
      );
    }
    closeItemMenu();
  };

  const handleSelectBranch = (branch: BranchCatalogItem) => {
    closeAddBranchMenu();
    onAddScheduledStop(branch.id, branch.name);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>Pedidos a entregar en {municipality}</Typography>
      {
        canEdit &&
        <>
          <Button
            variant="option"
            color="primary"
            sx={{ alignSelf: "flex-end" }}
            startIcon={<PlusCircle size={16} />}
            onClick={(event) => setAddBranchAnchor(event.currentTarget)}>
            Agregar sucursal
          </Button>
          <Menu
            open={Boolean(addBranchAnchor)}
            anchorEl={addBranchAnchor}
            onClose={closeAddBranchMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { sx: { minWidth: 240, maxHeight: 320 }, } }}>
            {
              (catalogLoading) ?
                <MenuItem disabled>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    py={0.5}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Cargando sucursales…</Typography>
                  </Stack>
                </MenuItem>
                : (availableBranches.length === 0) ?
                  <MenuItem disabled>No hay sucursales disponibles</MenuItem>
                  :
                  availableBranches.map((branch) => (
                    <MenuItem
                      key={branch.id}
                      onClick={() => handleSelectBranch(branch)}>
                      {branch.name}
                    </MenuItem>
                  ))
            }
          </Menu>
        </>
      }

      {
        (scheduledStops.length === 0) ?
          <Typography variant="body2" color="text.secondary">No hay sucursales destino configuradas en esta ruta.</Typography>
          :
          scheduledStops.map((stop) => {
            const branchItems = itemsByBranchId.get(stop.branchId) ?? [];
            return (
              <BranchCard key={stop.id}>
                <BranchHeader>
                  <Typography variant="body1" fontWeight={600} noWrap>{stop.name}</Typography>
                  {
                    canEdit &&
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Button
                        variant="option"
                        color="primary"
                        size="small"
                        startIcon={<PlusCircle size={16} />}
                        onClick={() => onAddOrdersForBranch(stop.branchId)}>
                        Agregar
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() =>
                          onRequestRemoveStop(stop.id, stop.branchId, stop.name)
                        }>
                        <Trash2 size={16} />
                      </IconButton>
                    </Stack>
                  }
                </BranchHeader>

                {
                  (branchItems.length === 0) ?
                    <BranchEmptyState>No tienes pedidos agregados en esta ruta aún.</BranchEmptyState>
                    :
                    <Stack>
                      {
                        branchItems.map((entry) => {
                          const itemMenuOpen =
                            itemMenu?.pointId === entry.pointId &&
                            itemMenu?.itemId === entry.item.id;
                          return (
                            <BranchItemRow key={`${entry.pointId}-${entry.item.id}`}>
                              <Stack direction="row" alignItems="center" spacing={1.5} flex={1} minWidth={0}>
                                <StatusChip
                                  size="small"
                                  label={ITEM_STATUS_LABELS[entry.item.status]}
                                  startIcon={
                                    <ItemStatusIcon status={entry.item.status} />
                                  }
                                />
                                <Typography variant="body2" color="text.primary" noWrap sx={{ flex: 1, minWidth: 0 }}>{entry.item.articleName}</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                                  {
                                    entry.item.addedBy.type === "user" && <User size={14} />
                                  }
                                  <Typography variant="body2" color="text.secondary" noWrap>{formatAddedBy(entry.item.addedBy)}</Typography>
                                </Stack>
                              </Stack>
                              {
                                canEdit && (
                                  <IconButton
                                    size="small"
                                    aria-label={`Opciones del artículo ${entry.item.articleName}`}
                                    onClick={(e) => handleItemMenuClick(e, entry)}>
                                    <MoreVertical size={18} />
                                  </IconButton>
                                )
                              }
                              <Menu
                                open={Boolean(itemMenu?.el) && itemMenuOpen}
                                anchorEl={itemMenu?.el ?? null}
                                onClose={closeItemMenu}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                transformOrigin={{ vertical: "top", horizontal: "right" }}>
                                <MenuItem
                                  onClick={handleConfirmRemoveItem}
                                  sx={{ color: "error.main", gap: 1 }}>
                                  <Trash2 size={16} />
                                  Remover Artículo
                                </MenuItem>
                              </Menu>
                            </BranchItemRow>
                          );
                        })
                      }
                    </Stack>
                }
              </BranchCard>
            );
          })
      }
    </Stack>
  );
}
