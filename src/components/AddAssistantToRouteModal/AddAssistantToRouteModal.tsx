"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Stack,
  Button,
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
import { mapAssistantCandidateToView } from "@/utils/rutas-api.mapper";
import type { RouteAssistantCandidate } from "@/types/rutas.types";
import type { RouteAssistantCandidateApi } from "@/types/rutas-api.types";
import {
  SearchInput,
  TableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
} from "./styles";

export interface AddAssistantToRouteModalProps {
  open: boolean;
  onClose: () => void;
  routeId: number;
  fetchAvailableAssistants: (
    routeId: number,
  ) => Promise<RouteAssistantCandidateApi[]>;
  onConfirm: (userId: number) => void | Promise<void>;
}

export function AddAssistantToRouteModal({
  open,
  onClose,
  routeId,
  fetchAvailableAssistants,
  onConfirm,
}: AddAssistantToRouteModalProps) {
  const [assistants, setAssistants] = useState<RouteAssistantCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearchQuery("");
      fetchAvailableAssistants(routeId)
        .then((rows) => setAssistants(rows.map(mapAssistantCandidateToView)))
        .catch(() => setAssistants([]))
        .finally(() => setLoading(false));
    }
  }, [open, routeId, fetchAvailableAssistants]);

  const filteredAssistants = useMemo(() => {
    if (!searchQuery.trim()) return assistants;
    const query = searchQuery.toLowerCase();
    return assistants.filter((assistant) => {
      const fullName = `${assistant.firstName} ${assistant.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        assistant.username.toLowerCase().includes(query) ||
        assistant.cellphone.toLowerCase().includes(query)
      );
    });
  }, [assistants, searchQuery]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleConfirm = async (userId: number) => {
    if (submitting) return;
    setSubmitting(true);
    setPendingId(userId);
    try {
      await onConfirm(userId);
      onClose();
    } finally {
      setSubmitting(false);
      setPendingId(null);
    }
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Agregar ayudante a esta ruta"
      description="Busca y selecciona al usuario que funcionará como ayudante en esta ruta."
      maxWidth="md"
      disableClose={submitting}
      contentSx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <SearchInput
        placeholder="Buscar por nombre, usuario o celular"
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
        ) : filteredAssistants.length === 0 ? (
          <EmptyStateContainer>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No se encontraron usuarios"
                : "No hay usuarios disponibles para agregar como ayudante"}
            </Typography>
          </EmptyStateContainer>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Nombre</StyledTableCell>
                <StyledTableCell>Usuario</StyledTableCell>
                <StyledTableCell>Celular</StyledTableCell>
                <StyledTableCell align="right">Acción</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssistants.map((assistant) => {
                const fullName =
                  `${assistant.firstName} ${assistant.lastName}`.trim();
                const isPending = pendingId === assistant.id;
                return (
                  <StyledTableRow key={assistant.id} hover>
                    <StyledTableCell>{fullName}</StyledTableCell>
                    <StyledTableCell>{assistant.username}</StyledTableCell>
                    <StyledTableCell>{assistant.cellphone}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => void handleConfirm(assistant.id)}
                        disabled={submitting}
                        startIcon={
                          isPending ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : undefined
                        }
                      >
                        Agregar
                      </Button>
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
