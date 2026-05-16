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
import { StatusChip, SideModal } from "@/components";
import { theme } from "@/styles/theme";
import type { ArticleToAdd } from "@/types/rutas.types";
import {
  SearchInput,
  TableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
} from "./styles";

export interface AddArticlesToRouteModalProps {
  open: boolean;
  onClose: () => void;
  routeId: number;
  fetchAvailableArticles: (routeId: number) => Promise<ArticleToAdd[]>;
  onConfirm: (articleIds: string[]) => void | Promise<void>;
}

export function AddArticlesToRouteModal({
  open,
  onClose,
  routeId,
  fetchAvailableArticles,
  onConfirm,
}: AddArticlesToRouteModalProps) {
  const [articles, setArticles] = useState<ArticleToAdd[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSelectedIds(new Set());
      setSearchQuery("");
      fetchAvailableArticles(routeId)
        .then((data) => setArticles(data))
        .catch(() => setArticles([]))
        .finally(() => setLoading(false));
    }
  }, [open, routeId, fetchAvailableArticles]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter((article) => article.sku.toLowerCase().includes(query));
  }, [articles, searchQuery]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(new Set(filteredArticles.map((article) => article.id)));
      return;
    }

    const nextSelectedIds = new Set(selectedIds);
    filteredArticles.forEach((article) => nextSelectedIds.delete(article.id));
    setSelectedIds(nextSelectedIds);
  };

  const handleSelectOne = (id: string) => {
    const nextSelectedIds = new Set(selectedIds);
    if (nextSelectedIds.has(id)) nextSelectedIds.delete(id);
    else nextSelectedIds.add(id);
    setSelectedIds(nextSelectedIds);
  };

  const isAllSelected =
    filteredArticles.length > 0 &&
    filteredArticles.every((article) => selectedIds.has(article.id));
  const isIndeterminate =
    filteredArticles.some((article) => selectedIds.has(article.id)) &&
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
      title="Agregar articulos a esta ruta"
      description="Selecciona los articulos que deseas agregar a esta ruta"
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
        placeholder="Buscar SKU"
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
        ) : filteredArticles.length === 0 ? (
          <EmptyStateContainer>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No se encontraron articulos"
                : "No hay articulos disponibles para agregar"}
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
                <StyledTableCell>SKU</StyledTableCell>
                <StyledTableCell>Tipo</StyledTableCell>
                <StyledTableCell>Articulo</StyledTableCell>
                <StyledTableCell>Zona</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.map((row) => {
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
                    <StyledTableCell>{row.sku}</StyledTableCell>
                    <StyledTableCell>
                      <StatusChip
                        size="small"
                        label={row.type}
                        variant={row.type === "Venta" ? "default" : "pending"}
                      />
                    </StyledTableCell>
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
