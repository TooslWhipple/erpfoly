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
import type { OrderToReceive, SupplierWithPendingOrders } from "@/types/recepcion-mercancias.types";
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
  onConfirm: (orderIds: string[]) => void | Promise<void>;
  loading?: boolean;
}

const DUMMY_ORDERS_TO_RECEIVE: OrderToReceive[] = [
  {
    id: "19988",
    sku: "19988",
    supplier: "Mabe",
    supplierLegalName: "Mabe S.A. de C.V.",
    deliveryDate: "2024-07-22",
    total: 398390.6,
  },
  {
    id: "19722",
    sku: "19722",
    supplier: "Mabe",
    supplierLegalName: "Mabe S.A. de C.V.",
    deliveryDate: "2024-07-22",
    total: 398390.6,
  },
  {
    id: "12345",
    sku: "12345",
    supplier: "Mabe",
    supplierLegalName: "Mabe S.A. de C.V.",
    deliveryDate: "2024-07-22",
    total: 398390.6,
  },
  {
    id: "12346",
    sku: "12346",
    supplier: "Whirlpool México",
    supplierLegalName: "Whirlpool México S. de R.L. de C.V.",
    deliveryDate: "2024-07-25",
    total: 245890.75,
  },
  {
    id: "12347",
    sku: "12347",
    supplier: "Whirlpool México",
    supplierLegalName: "Whirlpool México S. de R.L. de C.V.",
    deliveryDate: "2024-07-28",
    total: 567890.0,
  },
  {
    id: "12348",
    sku: "12348",
    supplier: "Distribuidora Hogar Feliz",
    supplierLegalName: "Distribuidora Hogar Feliz S.A. de C.V.",
    deliveryDate: "2024-08-01",
    total: 189450.25,
  },
];

const DUMMY_SUPPLIERS_WITHOUT_ORDERS: SupplierWithPendingOrders[] = [
  {
    id: "lg-mexico",
    name: "LG Electronics",
    legalName: "LG Electronics México S.A. de C.V.",
    pendingOrdersCount: 0,
    orderIds: [],
  },
];

async function getOrdersToReceive(): Promise<OrderToReceive[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return DUMMY_ORDERS_TO_RECEIVE;
}

function groupOrdersBySupplier(orders: OrderToReceive[]): SupplierWithPendingOrders[] {
  const map = new Map<string, SupplierWithPendingOrders>();

  for (const order of orders) {
    const key = order.supplier;
    const existing = map.get(key);
    if (existing) {
      existing.pendingOrdersCount += 1;
      existing.orderIds.push(order.id);
    } else {
      map.set(key, {
        id: key,
        name: order.supplier,
        legalName: order.supplierLegalName ?? order.supplier,
        pendingOrdersCount: 1,
        orderIds: [order.id],
      });
    }
  }

  return [...map.values(), ...DUMMY_SUPPLIERS_WITHOUT_ORDERS];
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
  const [orders, setOrders] = useState<OrderToReceive[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [creatingSupplierId, setCreatingSupplierId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setLoadingOrders(true);
      setCreatingSupplierId(null);
      setSearchQuery("");
      getOrdersToReceive()
        .then((data) => {
          setOrders(data);
        })
        .catch((err) => {
          console.error("[ReceptionOrdersModal] Error fetching orders:", err);
        })
        .finally(() => {
          setLoadingOrders(false);
        });
    } else {
      setCreatingSupplierId(null);
      setSearchQuery("");
    }
  }, [open]);

  const suppliers = useMemo(() => groupOrdersBySupplier(orders), [orders]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) {
      return suppliers;
    }
    const query = searchQuery.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.legalName.toLowerCase().includes(query),
    );
  }, [suppliers, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCreate = async (supplier: SupplierWithPendingOrders) => {
    if (supplier.pendingOrdersCount === 0 || loading || creatingSupplierId) {
      return;
    }
    setCreatingSupplierId(supplier.id);
    try {
      await onConfirm(supplier.orderIds);
    } finally {
      setCreatingSupplierId(null);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingOrders && !creatingSupplierId) {
      onClose();
    }
  };

  const isBusy = loading || loadingOrders || creatingSupplierId != null;

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
        disabled={loadingOrders}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      {loadingOrders ? (
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
                  <SupplierCardLegalName>{supplier.legalName}</SupplierCardLegalName>
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
