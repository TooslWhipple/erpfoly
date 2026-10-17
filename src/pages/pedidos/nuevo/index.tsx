import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Stack } from "@mui/material";
import OrderForm from "@/components/OrderForm";
import { SupplierSelectionModal } from "@/components/SupplierSelectionModal";
import type { Supplier } from "@/types/pedidos.types";

function queryParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && value[0]) return value[0];
  return undefined;
}

export default function NuevoPedido() {
  const router = useRouter();
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);

  const supplierId = queryParam(router.query.supplierId);
  const supplierName = queryParam(router.query.supplierName);
  const hasSupplier = Boolean(supplierId && supplierName);

  useEffect(() => {
    if (!router.isReady) return;
    if (!hasSupplier) {
      setSupplierModalOpen(true);
    }
  }, [router.isReady, hasSupplier]);

  const handleSupplierSelect = (supplier: Supplier) => {
    setSupplierModalOpen(false);
    void router.replace({
      pathname: "/pedidos/nuevo",
      query: {
        supplierId: supplier.id,
        supplierName: supplier.name,
      },
    });
  };

  const handleCloseSupplierModal = () => {
    setSupplierModalOpen(false);
    void router.push("/pedidos");
  };

  if (!router.isReady) {
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: 400 }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!hasSupplier) {
    return (
      <SupplierSelectionModal
        open={supplierModalOpen}
        onClose={handleCloseSupplierModal}
        onSelect={handleSupplierSelect}
      />
    );
  }

  return <OrderForm mode="create" orderType="external" />;
}
