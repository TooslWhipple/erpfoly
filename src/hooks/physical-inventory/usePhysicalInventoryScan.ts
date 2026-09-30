import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getPhysicalInventoryBranchProductByCode,
  getPhysicalInventoryBranchProducts,
} from "@/services/physical-inventory.service";
import {
  getProductById,
  searchProducts,
} from "@/services/productos.service";
import { normalizeScannedProductCode } from "@/utils/productCode";
import type {
  PhysicalInventoryBranchProduct,
  PhysicalInventoryItem,
  PhysicalInventoryLastScannedProduct,
} from "@/types/physical-inventory.types";
import {
  PHYSICAL_INVENTORY_PAGE_SIZE,
  PHYSICAL_INVENTORY_UNREVIEWED,
} from "@/types/physical-inventory.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function toScanItem(product: {
  productId: number;
  code: string;
  name: string;
  categoryPath?: string;
  systemQuantity: number;
  countedQuantity?: number;
  wasScanned?: boolean;
  isSurplus?: boolean;
}): PhysicalInventoryItem {
  return {
    productId: product.productId,
    code: product.code,
    name: product.name,
    categoryPath: product.categoryPath ?? "",
    systemQuantity: product.systemQuantity,
    countedQuantity: product.countedQuantity ?? PHYSICAL_INVENTORY_UNREVIEWED,
    wasScanned: product.wasScanned ?? false,
    isSurplus: product.isSurplus ?? false,
  };
}

function toLastScanned(
  product: PhysicalInventoryBranchProduct,
  isSurplus = false,
): PhysicalInventoryLastScannedProduct {
  return {
    productId: product.productId,
    code: product.code,
    name: product.name,
    description: product.description ?? null,
    supplierName: product.supplierName ?? "",
    department: product.department,
    line: product.line,
    imageUrl: product.imageUrl ?? null,
    isSurplus,
  };
}

function matchesSearch(
  item: { name: string; code: string },
  q: string,
): boolean {
  if (!q) return true;
  return (
    item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
  );
}

export function usePhysicalInventoryScan(branchId: number | null) {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const [captures, setCaptures] = useState<
    Record<number, PhysicalInventoryItem>
  >({});
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);
  const [lastScanned, setLastScanned] =
    useState<PhysicalInventoryLastScannedProduct | null>(null);
  const [search, setSearch] = useState("");
  const [scanningBusy, setScanningBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const query = useInfiniteQuery({
    queryKey: [
      "physical-inventory-branch-products",
      branchId,
      debouncedSearch,
    ],
    queryFn: async ({ pageParam }) => {
      if (!branchId) {
        throw new Error("Sucursal no seleccionada");
      }
      const result = await getPhysicalInventoryBranchProducts(branchId, {
        page: pageParam,
        limit: PHYSICAL_INVENTORY_PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error("No se pudo cargar el inventario");
      return result.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: Boolean(branchId),
  });

  useEffect(() => {
    if (query.isError) {
      showError(
        query.error instanceof Error
          ? query.error.message
          : "No se pudieron cargar los artículos de la sucursal",
      );
    }
  }, [query.error, query.isError, showError]);

  const branch = query.data?.pages[0]?.branch ?? null;
  const catalogTotal = query.data?.pages[0]?.total ?? 0;

  const pinProduct = useCallback((productId: number) => {
    setPinnedIds((prev) => [
      productId,
      ...prev.filter((id) => id !== productId),
    ]);
  }, []);

  const applyCapture = useCallback(
    (item: PhysicalInventoryItem, nextQuantity: number) => {
      setCaptures((prev) => ({
        ...prev,
        [item.productId]: {
          ...item,
          countedQuantity: nextQuantity,
          wasScanned: true,
        },
      }));
      pinProduct(item.productId);
    },
    [pinProduct],
  );

  const visibleItems = useMemo(() => {
    const rows = query.data?.pages.flatMap((page) => page.rows) ?? [];
    const catalogById = new Map(
      rows.map((product) => [product.productId, product]),
    );
    const q = debouncedSearch.toLowerCase();

    const mergeItem = (
      productId: number,
      fallback?: PhysicalInventoryItem,
    ): PhysicalInventoryItem | null => {
      const catalog = catalogById.get(productId);
      const capture = captures[productId];
      if (catalog) {
        return {
          ...toScanItem(catalog),
          countedQuantity:
            capture?.countedQuantity ?? PHYSICAL_INVENTORY_UNREVIEWED,
          wasScanned: capture?.wasScanned ?? false,
          isSurplus: capture?.isSurplus ?? false,
        };
      }
      if (capture && matchesSearch(capture, q)) {
        return capture;
      }
      if (fallback && matchesSearch(fallback, q)) {
        return fallback;
      }
      return null;
    };

    const pinnedItems: PhysicalInventoryItem[] = [];
    const pinnedSet = new Set<number>();
    for (const productId of pinnedIds) {
      const item = mergeItem(productId, captures[productId]);
      if (!item || !matchesSearch(item, q)) continue;
      pinnedItems.push(item);
      pinnedSet.add(productId);
    }

    const rest = rows
      .filter((product) => !pinnedSet.has(product.productId))
      .map((product) => mergeItem(product.productId)!)
      .filter(Boolean);

    const extraCaptures = Object.values(captures).filter(
      (item) =>
        !pinnedSet.has(item.productId) &&
        !catalogById.has(item.productId) &&
        matchesSearch(item, q),
    );

    return [...pinnedItems, ...extraCaptures, ...rest];
  }, [captures, debouncedSearch, pinnedIds, query.data?.pages]);

  const reviewedItems = useMemo(
    () =>
      Object.values(captures).filter(
        (item) => item.countedQuantity >= 0 || item.isSurplus,
      ),
    [captures],
  );

  const updateCountedQuantity = useCallback(
    (
      productId: number,
      countedQuantity: number,
      base?: PhysicalInventoryItem,
    ) => {
      setCaptures((prev) => {
        const existing = prev[productId] ?? base;
        if (!existing) return prev;

        const nextQuantity = Math.max(
          PHYSICAL_INVENTORY_UNREVIEWED,
          countedQuantity,
        );
        if (nextQuantity < 0) {
          if (!(productId in prev)) return prev;
          const { [productId]: _removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [productId]: {
            ...existing,
            countedQuantity: nextQuantity,
            wasScanned: existing.wasScanned || nextQuantity > 0,
            isSurplus: existing.isSurplus,
          },
        };
      });

      if (countedQuantity < 0) {
        setPinnedIds((prev) => prev.filter((id) => id !== productId));
        setLastScanned((prev) =>
          prev?.productId === productId ? null : prev,
        );
      }
    },
    [],
  );

  const removeLastScanned = useCallback(() => {
    if (!lastScanned) return;
    const productId = lastScanned.productId;
    setCaptures((prev) => {
      if (!(productId in prev)) return prev;
      const { [productId]: _removed, ...rest } = prev;
      return rest;
    });
    setPinnedIds((prev) => prev.filter((id) => id !== productId));
    setLastScanned(null);
  }, [lastScanned]);

  const resolveSurplusCard = useCallback(
    async (
      productId: number,
      code: string,
      name: string,
      description?: string | null,
    ): Promise<PhysicalInventoryLastScannedProduct> => {
      const detail = await getProductById(productId);
      if (!detail.error && detail.data) {
        const primarySupplier =
          detail.data.suppliers.find((s) => s.isPrimary) ??
          detail.data.suppliers[0];
        const primaryImage =
          detail.data.images.find((img) => img.isPrimary) ??
          detail.data.images[0];
        return {
          productId,
          code: detail.data.code,
          name: detail.data.shortName,
          description: detail.data.description?.trim() || null,
          supplierName: primarySupplier?.supplierName?.trim() || "",
          department: "",
          line: "",
          imageUrl:
            primaryImage?.previewUrl?.trim() ||
            primaryImage?.imageUrl?.trim() ||
            null,
          isSurplus: true,
        };
      }

      return {
        productId,
        code,
        name,
        description: description?.trim() || null,
        supplierName: "",
        department: "",
        line: "",
        imageUrl: null,
        isSurplus: true,
      };
    },
    [],
  );

  const handleCodeScanned = useCallback(
    async (rawCode: string) => {
      const code = normalizeScannedProductCode(rawCode);
      if (!code || scanningBusy || !branchId) return;

      setScanningBusy(true);
      try {
        const fromCapture = Object.values(captures).find(
          (item) => item.code.toLowerCase() === code.toLowerCase(),
        );
        const fromVisible = visibleItems.find(
          (item) => item.code.toLowerCase() === code.toLowerCase(),
        );
        const existing = fromCapture ?? fromVisible;

        if (existing) {
          const nextQuantity =
            existing.countedQuantity < 0 ? 1 : existing.countedQuantity + 1;
          applyCapture(existing, nextQuantity);

          if (existing.isSurplus) {
            setLastScanned(
              await resolveSurplusCard(
                existing.productId,
                existing.code,
                existing.name,
              ),
            );
          } else {
            const branchResult = await getPhysicalInventoryBranchProductByCode(
              branchId,
              code,
            );
            if (!branchResult.error && branchResult.data) {
              setLastScanned(toLastScanned(branchResult.data));
            } else {
              setLastScanned({
                productId: existing.productId,
                code: existing.code,
                name: existing.name,
                description: null,
                supplierName: "",
                department: "",
                line: "",
                imageUrl: null,
                isSurplus: false,
              });
            }
          }

          showSuccess(`Escaneado: ${existing.name}`);
          return;
        }

        const branchResult = await getPhysicalInventoryBranchProductByCode(
          branchId,
          code,
        );

        if (!branchResult.error && branchResult.data) {
          const product = branchResult.data;
          const current = captures[product.productId];
          const base = current ?? toScanItem(product);
          const nextQuantity =
            base.countedQuantity < 0 ? 1 : base.countedQuantity + 1;
          applyCapture(base, nextQuantity);
          setLastScanned(toLastScanned(product));
          showSuccess(`Escaneado: ${product.name}`);
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

        const already = captures[match.id];
        const nextQuantity =
          already && already.countedQuantity >= 0
            ? already.countedQuantity + 1
            : 1;
        const surplusItem: PhysicalInventoryItem = {
          productId: match.id,
          code: match.code,
          name: match.shortName,
          categoryPath: "",
          systemQuantity: 0,
          countedQuantity: nextQuantity,
          wasScanned: true,
          isSurplus: true,
        };
        applyCapture(surplusItem, nextQuantity);
        setLastScanned(
          await resolveSurplusCard(
            match.id,
            match.code,
            match.shortName,
            match.description,
          ),
        );
        showSuccess(`Sobrante agregado: ${match.shortName}`);
      } finally {
        setScanningBusy(false);
      }
    },
    [
      applyCapture,
      branchId,
      captures,
      resolveSurplusCard,
      scanningBusy,
      showError,
      showSuccess,
      visibleItems,
    ],
  );

  const fetchNextPage = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  return {
    branch,
    visibleItems,
    reviewedItems,
    catalogTotal,
    lastScanned,
    search,
    setSearch,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage,
    scanningBusy,
    updateCountedQuantity,
    handleCodeScanned,
    removeLastScanned,
  };
}
