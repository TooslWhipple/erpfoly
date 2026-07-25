import { useState, useEffect, useMemo } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Search } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import type { SupplierWithPendingOrders } from "@/types/recepcion-mercancias.types";
import { getSuppliersWithPendingOrders } from "@/services/recepcion-mercancias.service";
import {
  SearchInput,
  SupplierList,
  SupplierCard,
  SupplierCardInfo,
  SupplierCardName,
  SupplierCardLegalName,
  SupplierCardMeta,
  CreateButton,
  EmptyStateContainer,
} from "./styles";

interface ReceptionOrdersModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (supplierId: number, supplierName: string) => void | Promise<void>;
  loading?: boolean;
}

function formatPendingOrdersLabel(count: number): string {
  if (count === 1) return "1 pedido pendiente";
  return `${count} pedidos pendientes`;
}

export function ReceptionOrdersModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: ReceptionOrdersModalProps) {
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState<SupplierWithPendingOrders[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [creatingSupplierId, setCreatingSupplierId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setLoadingSuppliers(true);
      setCreatingSupplierId(null);
      setSearchQuery("");
      getSuppliersWithPendingOrders()
        .then((result) => {
          if (result.error) {
            console.error(
              "[ReceptionOrdersModal] Error fetching suppliers:",
              result.error,
            );
            setSuppliers([]);
            return;
          }
          setSuppliers(result.data ?? []);
        })
        .catch((err) => {
          console.error("[ReceptionOrdersModal] Error fetching suppliers:", err);
          setSuppliers([]);
        })
        .finally(() => {
          setLoadingSuppliers(false);
        });
    } else {
      setCreatingSupplierId(null);
      setSearchQuery("");
    }
  }, [open]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) {
      return suppliers;
    }
    const query = searchQuery.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        (supplier.legalName ?? "").toLowerCase().includes(query),
    );
  }, [suppliers, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCreate = async (supplier: SupplierWithPendingOrders) => {
    if (supplier.pendingOrdersCount === 0 || loading || creatingSupplierId != null) {
      return;
    }
    setCreatingSupplierId(supplier.id);
    try {
      await onConfirm(supplier.id, supplier.legalName ?? supplier.name);
    } finally {
      setCreatingSupplierId(null);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingSuppliers && creatingSupplierId == null) {
      onClose();
    }
  };

  const isBusy = loading || loadingSuppliers || creatingSupplierId != null;

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Nueva recepción de mercancía"
      maxWidth="md"
      disableClose={isBusy}
      contentSx={{ flex: 1, minHeight: 0 }}
    >
      <SearchInput
        placeholder="Buscar proveedor"
        value={searchQuery}
        onChange={handleSearchChange}
        size="small"
        fullWidth
        disabled={loadingSuppliers}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      {loadingSuppliers ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={72} />
          ))}
        </Box>
      ) : filteredSuppliers.length === 0 ? (
        <EmptyStateContainer>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? "No se encontraron proveedores"
              : "No hay proveedores con pedidos por recibir"}
          </Typography>
        </EmptyStateContainer>
      ) : (
        <SupplierList>
          {filteredSuppliers.map((supplier) => {
            const isCreating = creatingSupplierId === supplier.id;
            const canCreate = supplier.pendingOrdersCount > 0;

            return (
              <SupplierCard key={supplier.id}>
                <SupplierCardInfo>
                  <SupplierCardName>{supplier.name}</SupplierCardName>
                  <SupplierCardLegalName>
                    {supplier.legalName ?? supplier.name}
                  </SupplierCardLegalName>
                </SupplierCardInfo>
                <SupplierCardMeta>
                  {formatPendingOrdersLabel(supplier.pendingOrdersCount)}
                </SupplierCardMeta>
                <CreateButton
                  variant="outlined"
                  color="primary"
                  disabled={!canCreate || isBusy}
                  onClick={() => handleCreate(supplier)}
                >
                  {isCreating ? <CircularProgress size={18} color="inherit" /> : "Crear"}
                </CreateButton>
              </SupplierCard>
            );
          })}
        </SupplierList>
      )}
    </SideModal>
  );
}
