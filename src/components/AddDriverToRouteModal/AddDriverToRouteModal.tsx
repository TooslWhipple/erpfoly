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
import {
  mapDriverCandidateToView,
} from "@/utils/rutas-api.mapper";
import type {
  RouteDriverCandidate,
} from "@/types/rutas.types";
import type { RouteDriverCandidateApi } from "@/types/rutas-api.types";
import {
  SearchInput,
  TableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyStateContainer,
} from "./styles";

export interface AddDriverToRouteModalProps {
  open: boolean;
  onClose: () => void;
  routeId: number;
  fetchAvailableDrivers: (
    routeId: number,
  ) => Promise<RouteDriverCandidateApi[]>;
  onConfirm: (driverId: number) => void | Promise<void>;
}

export function AddDriverToRouteModal({
  open,
  onClose,
  routeId,
  fetchAvailableDrivers,
  onConfirm,
}: AddDriverToRouteModalProps) {
  const [drivers, setDrivers] = useState<RouteDriverCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearchQuery("");
      fetchAvailableDrivers(routeId)
        .then((rows) => setDrivers(rows.map(mapDriverCandidateToView)))
        .catch(() => setDrivers([]))
        .finally(() => setLoading(false));
    }
  }, [open, routeId, fetchAvailableDrivers]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery.trim()) return drivers;
    const query = searchQuery.toLowerCase();
    return drivers.filter((driver) => {
      const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        (driver.licenseNumber?.toLowerCase().includes(query) ?? false) ||
        (driver.phone?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [drivers, searchQuery]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleConfirm = async (driverId: number) => {
    if (submitting) return;
    setSubmitting(true);
    setPendingId(driverId);
    try {
      await onConfirm(driverId);
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
      title="Agregar chofer a esta ruta"
      description="Busca y selecciona al chofer que asignarás a esta ruta."
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
        placeholder="Buscar por nombre, licencia o teléfono"
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
        ) : filteredDrivers.length === 0 ? (
          <EmptyStateContainer>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No se encontraron choferes"
                : "No hay choferes disponibles para asignar"}
            </Typography>
          </EmptyStateContainer>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ minWidth: "160px" }}>Nombre</StyledTableCell>
                <StyledTableCell sx={{ minWidth: "144px" }}>Licencia</StyledTableCell>
                <StyledTableCell sx={{ minWidth: "112px" }}>Teléfono</StyledTableCell>
                <StyledTableCell sx={{ minWidth: "112px" }}>Estado</StyledTableCell>
                <StyledTableCell align="right">Acción</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                filteredDrivers.map((driver) => {
                  const fullName = `${driver.firstName} ${driver.lastName}`.trim();
                  const isPending = pendingId === driver.id;

                  return (
                    <StyledTableRow key={driver.id} hover>
                      <StyledTableCell>{fullName}</StyledTableCell>
                      <StyledTableCell>{driver.licenseNumber}</StyledTableCell>
                      <StyledTableCell>{driver.phone}</StyledTableCell>
                      <StyledTableCell>{driver.status}</StyledTableCell>
                      <StyledTableCell align="right">
                        <Button
                          variant="option"
                          color="primary"
                          size="small"
                          onClick={() => void handleConfirm(driver.id)}
                          disabled={submitting}>
                          {(isPending) ? <CircularProgress size={14} color="inherit" /> : "Agregar"}
                        </Button>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </SideModal>
  );
}
