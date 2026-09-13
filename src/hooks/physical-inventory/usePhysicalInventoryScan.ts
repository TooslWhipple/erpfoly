import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPhysicalInventoryBranchProducts } from "@/services/physical-inventory.service";
import { searchProducts } from "@/services/productos.service";
import { normalizeScannedProductCode } from "@/utils/productCode";
import type { PhysicalInventoryItem } from "@/types/physical-inventory.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";

function toScanItem(product: {
  productId: number;
  code: string;
  name: string;
  categoryPath?: string;
  systemQuantity: number;
}): PhysicalInventoryItem {
  return {
    productId: product.productId,
    code: product.code,
    name: product.name,
    categoryPath: product.categoryPath ?? "",
    systemQuantity: product.systemQuantity,
    countedQuantity: 0,
    wasScanned: false,
    isSurplus: false,
  };
}

export function usePhysicalInventoryScan(branchId: number | null) {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const [items, setItems] = useState<PhysicalInventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [scanningBusy, setScanningBusy] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["physical-inventory-branch-products", branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const result = await getPhysicalInventoryBranchProducts(branchId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(branchId),
  });

  useEffect(() => {
    if (!data?.products) return;
    setItems(data.products.map(toScanItem));
  }, [data]);

  useEffect(() => {
    if (isError) {
      showError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los artículos de la sucursal",
      );
    }
  }, [error, isError, showError]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    );
  }, [items, search]);

  const updateCountedQuantity = useCallback(
    (productId: number, countedQuantity: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                countedQuantity: Math.max(0, countedQuantity),
                wasScanned: item.wasScanned || countedQuantity > 0,
              }
            : item,
        ),
      );
    },
    [],
  );

  const handleCodeScanned = useCallback(
    async (rawCode: string) => {
      const code = normalizeScannedProductCode(rawCode);
      if (!code || scanningBusy) return;

      setScanningBusy(true);
      try {
        const existing = items.find(
          (item) => item.code.toLowerCase() === code.toLowerCase(),
        );

        if (existing) {
          setItems((prev) =>
            prev.map((item) =>
              item.productId === existing.productId
                ? {
                    ...item,
                    countedQuantity: item.countedQuantity + 1,
                    wasScanned: true,
                  }
                : item,
            ),
          );
          showSuccess(`Escaneado: ${existing.name}`);
          return;
        }

        const searchResult = await searchProducts({ q: code, limit: 5 });
        if (searchResult.error) {
          showError(searchResult.error.message);
          return;
        }

        const match =
          searchResult.data?.find(
            (product) => product.code.toLowerCase() === code.toLowerCase(),
          ) ?? searchResult.data?.[0];

        if (!match) {
          showError(`No se encontró un artículo con el código ${code}`);
          return;
        }

        setItems((prev) => {
          const already = prev.find((item) => item.productId === match.id);
          if (already) {
            return prev.map((item) =>
              item.productId === match.id
                ? {
                    ...item,
                    countedQuantity: item.countedQuantity + 1,
                    wasScanned: true,
                  }
                : item,
            );
          }

          return [
            ...prev,
            {
              productId: match.id,
              code: match.code,
              name: match.shortName,
              categoryPath: "",
              systemQuantity: 0,
              countedQuantity: 1,
              wasScanned: true,
              isSurplus: true,
            },
          ];
        });
        showSuccess(`Sobrante agregado: ${match.shortName}`);
      } finally {
        setScanningBusy(false);
      }
    },
    [items, scanningBusy, showError, showSuccess],
  );

  return {
    branch: data?.branch ?? null,
    items,
    filteredItems,
    search,
    setSearch,
    isLoading,
    scanningBusy,
    updateCountedQuantity,
    handleCodeScanned,
  };
}
