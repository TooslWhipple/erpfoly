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
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { SideModal } from "@/components";
import { theme } from "@/styles/theme";
import type { OrderToAdd } from "@/types/rutas.types";
import {
  SearchInput,
  TableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
} from "./styles";

export interface AddOrdersToRouteModalProps {
  open: boolean;
  onClose: () => void;
  routeId: number;
  fetchAvailableOrders: (routeId: number) => Promise<OrderToAdd[]>;
  onConfirm: (orderIds: string[]) => void | Promise<void>;
}

/** @deprecated Use AddOrdersToRouteModal */
export type AddArticlesToRouteModalProps = AddOrdersToRouteModalProps;

export function AddOrdersToRouteModal({
  open,
  onClose,
  routeId,
  fetchAvailableOrders,
  onConfirm,
}: AddOrdersToRouteModalProps) {
  const [orders, setOrders] = useState<OrderToAdd[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSelectedIds(new Set());
      setSearchQuery("");
      fetchAvailableOrders(routeId)
        .then((data) => setOrders(data))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [open, routeId, fetchAvailableOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter((order) =>
      order.orderNumber.toLowerCase().includes(query),
    );
  }, [orders, searchQuery]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(new Set(filteredOrders.map((order) => order.id)));
      return;
    }

    const nextSelectedIds = new Set(selectedIds);
    filteredOrders.forEach((order) => nextSelectedIds.delete(order.id));
    setSelectedIds(nextSelectedIds);
  };

  const handleSelectOne = (id: string) => {
    const nextSelectedIds = new Set(selectedIds);
    if (nextSelectedIds.has(id)) nextSelectedIds.delete(id);
    else nextSelectedIds.add(id);
    setSelectedIds(nextSelectedIds);
  };

  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) => selectedIds.has(order.id));
  const isIndeterminate =
    filteredOrders.some((order) => selectedIds.has(order.id)) &&
    !isAllSelected;

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      await onConfirm(Array.from(selectedIds));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const addButtonLabel =
    selectedIds.size > 0 ? `Agregar [${selectedIds.size}]` : "Agregar";

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Agregar pedidos a esta ruta"
      description="Selecciona los pedidos que deseas agregar a esta ruta"
      maxWidth="md"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={selectedIds.size === 0 || submitting}
          startIcon={
            submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : undefined
          }
        >
          {addButtonLabel}
        </Button>
      }
      contentSx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <SearchInput
        placeholder="Buscar por número de pedido"
        value={searchQuery}
        onChange={handleSearchChange}
        size="small"
        fullWidth
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer>
        {loading ? (
          <Stack direction="row" justifyContent="center" sx={{ p: 2 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : filteredOrders.length === 0 ? (
          <EmptyStateContainer>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No se encontraron pedidos"
                : "No hay pedidos disponibles para agregar"}
            </Typography>
          </EmptyStateContainer>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell padding="checkbox" sx={{ width: 48 }}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    disabled={submitting}
                  />
                </StyledTableCell>
                <StyledTableCell>Número</StyledTableCell>
                <StyledTableCell>Dirección</StyledTableCell>
                <StyledTableCell>Zona</StyledTableCell>
                <StyledTableCell>Artículos</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <StyledTableRow key={row.id} selected={isSelected} hover>
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(row.id)}
                        disabled={submitting}
                      />
                    </StyledTableCell>
                    <StyledTableCell>{row.orderNumber}</StyledTableCell>
                    <StyledTableCell
                      sx={{
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.address}
                    </StyledTableCell>
                    <StyledTableCell>{row.zone}</StyledTableCell>
                    <StyledTableCell>{row.articleCount}</StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </SideModal>
  );
}

/** @deprecated Use AddOrdersToRouteModal */
export const AddArticlesToRouteModal = AddOrdersToRouteModal;
