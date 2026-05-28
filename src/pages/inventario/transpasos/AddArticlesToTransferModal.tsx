"use client";

import { useState, useEffect, useMemo } from "react";
import {
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
import { Search } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { StatusChip } from "@/components/StatusChip";
import type { TransferArticleOption } from "@/types/transpasos.types";
import { getAvailableArticlesToAddToTransfer } from "@/data/transpasos.mockData";
import { theme } from "@/styles/theme";
import {
  SearchInput,
  TableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
} from "@/styles/inventario/addArticlesToTransferModal.styles";

export interface AddArticlesToTransferModalProps {
  open: boolean;
  onClose: () => void;
  transferId?: number | string;
  existingArticleIds?: string[];
  onConfirm: (articles: TransferArticleOption[]) => void | Promise<void>;
}

export function AddArticlesToTransferModal({
  open,
  onClose,
  transferId,
  existingArticleIds = [],
  onConfirm,
}: AddArticlesToTransferModalProps) {
  const [articles, setArticles] = useState<TransferArticleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSelectedIds(new Set());
      setSearchQuery("");
      getAvailableArticlesToAddToTransfer(transferId?.toString(), "")
        .then((data) => setArticles(data))
        .catch(() => setArticles([]))
        .finally(() => setLoading(false));
    }
  }, [open, transferId]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const selectable = filteredArticles.filter(
        (a) => !existingArticleIds.includes(a.id)
      );
      setSelectedIds(new Set(selectable.map((a) => a.id)));
    } else {
      const next = new Set(selectedIds);
      filteredArticles.forEach((a) => next.delete(a.id));
      setSelectedIds(next);
    }
  };

  const handleSelectOne = (id: string) => {
    if (existingArticleIds.includes(id)) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const isAllSelected =
    filteredArticles.length > 0 &&
    filteredArticles
      .filter((a) => !existingArticleIds.includes(a.id))
      .every((a) => selectedIds.has(a.id));
  const isIndeterminate =
    filteredArticles.some((a) => selectedIds.has(a.id)) && !isAllSelected;

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return;
    const selected = articles.filter((a) => selectedIds.has(a.id));
    setSubmitting(true);
    try {
      await onConfirm(selected);
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
      title="Agregar artículos a este traspaso"
      description="Selecciona los artículos que deseas traspasar a esta sucursal"
      maxWidth="lg"
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
      contentSx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <SearchInput
        placeholder="Buscar artículo"
        value={searchQuery}
        onChange={handleSearchChange}
        size="small"
        fullWidth
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer>
        {loading ? (
          <Typography
            component="div"
            sx={{ p: 2, display: "flex", justifyContent: "center" }}
          >
            <CircularProgress size={32} />
          </Typography>
        ) : filteredArticles.length === 0 ? (
          <EmptyStateContainer>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No se encontraron artículos"
                : "No hay artículos disponibles para agregar"}
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
                <StyledTableCell>Código</StyledTableCell>
                <StyledTableCell>Nombre</StyledTableCell>
                <StyledTableCell>En existencia</StyledTableCell>
                <StyledTableCell>En tránsito</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.map((row) => {
                const isSelected = selectedIds.has(row.id);
                const isExisting = existingArticleIds.includes(row.id);
                return (
                  <StyledTableRow
                    key={row.id}
                    selected={isSelected}
                    hover
                    sx={
                      isExisting
                        ? { opacity: 0.6, backgroundColor: "action.hover" }
                        : undefined
                    }
                  >
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected || isExisting}
                        disabled={isExisting || submitting}
                        onChange={() => handleSelectOne(row.id)}
                      />
                    </StyledTableCell>
                    <StyledTableCell>{row.code}</StyledTableCell>
                    <StyledTableCell
                      sx={{
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.name}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip
                        size="small"
                        label={String(row.inStock)}
                        variant="success"
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip
                        size="small"
                        label={String(row.inTransit)}
                        variant="pending"
                      />
                    </StyledTableCell>
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

const AddArticlesToTransferModalPage = () => null;

export default AddArticlesToTransferModalPage;
