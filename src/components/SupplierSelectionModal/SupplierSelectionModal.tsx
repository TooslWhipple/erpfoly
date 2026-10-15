"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    InputAdornment,
    Button,
    LinearProgress,
    Skeleton,
    Typography,
    useTheme,
} from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { Supplier } from "@/types/pedidos.types";
import { unwrapOrThrow } from "@/lib/axios";
import { SideModal } from "@/components/SideModal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    searchSuppliers,
    type SupplierSearchItem,
} from "@/services/suppliers.service";
import {
    SearchInput,
    Card,
    SuppliersList,
    StatusPane,
    ListNotice,
    SupplierListRow,
    SupplierListHeader,
    SupplierColumnLabel,
    SupplierIdText,
    SupplierNameText,
} from "./styles";
import { Search } from "lucide-react";

const SUPPLIER_SEARCH_PAGE_SIZE = 50;
const SUPPLIER_SEARCH_DEBOUNCE_MS = 400;
const INITIAL_PLACEHOLDER_ROWS = 8;
const SUPPLIERS_SEARCH_QUERY_KEY = ["suppliers-search"] as const;

function SupplierPlaceholderRows({ count }: { count: number }) {
    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <SupplierListRow key={`placeholder-${index}`}>
                    <Skeleton variant="text" width={28} />
                    <Skeleton variant="text" width={`${52 + (index % 3) * 14}%`} />
                    <Skeleton variant="rounded" width={120} height={36} />
                </SupplierListRow>
            ))}
        </>
    );
}

function mapSearchItemToSupplier(item: SupplierSearchItem): Supplier {
    const displayName =
        item.businessName != null && item.businessName.trim().length > 0
            ? `${item.name} - ${item.businessName.trim()}`
            : item.name;
    return {
        id: String(item.id),
        name: displayName,
    };
}

export interface SupplierSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (supplier: Supplier) => void;
}

export function SupplierSelectionModal({
    open,
    onClose,
    onSelect,
}: SupplierSelectionModalProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebouncedValue(
        searchQuery.trim(),
        SUPPLIER_SEARCH_DEBOUNCE_MS,
    );
    const queryText = searchQuery.trim() === "" ? "" : debouncedQuery;
    const listRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const {
        data,
        isFetching,
        isPending,
        isError,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: [...SUPPLIERS_SEARCH_QUERY_KEY, queryText],
        queryFn: async ({ pageParam }) =>
            unwrapOrThrow(
                await searchSuppliers({
                    q: queryText,
                    limit: SUPPLIER_SEARCH_PAGE_SIZE,
                    page: pageParam,
                }),
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
        enabled: open,
        staleTime: 30_000,
    });

    const suppliers = useMemo(
        () => (data?.pages ?? []).flatMap((page) => page.rows).map(mapSearchItemToSupplier),
        [data],
    );

    const pagingRef = useRef({
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage,
    });

    useEffect(() => {
        pagingRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const attachScrollObserver = useCallback(() => {
        const root = listRef.current;
        const sentinel = sentinelRef.current;
        if (!open || !root || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const paging = pagingRef.current;
                if (!paging.hasNextPage || paging.isFetchingNextPage) return;
                if (entries.some((entry) => entry.isIntersecting)) {
                    void paging.fetchNextPage();
                }
            },
            { root, rootMargin: "160px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [open]);

    useEffect(() => {
        if (!open) {
            queryClient.removeQueries({ queryKey: SUPPLIERS_SEARCH_QUERY_KEY });
            return;
        }
        listRef.current?.scrollTo({ top: 0 });
    }, [open, queryText, queryClient]);

    useEffect(() => {
        if (!open) return;
        return attachScrollObserver();
    }, [open, attachScrollObserver, hasNextPage, suppliers.length]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSelect = (supplier: Supplier) => {
        onSelect(supplier);
        setSearchQuery("");
        onClose();
    };

    const handleClose = () => {
        setSearchQuery("");
        onClose();
    };

    const showInitialLoading = open && isPending && suppliers.length === 0;
    const showSearchProgress = isFetching && !isFetchingNextPage && !showInitialLoading;
    const showEmpty = !showInitialLoading && !isError && suppliers.length === 0;

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            title="Proveedores"
            description="Selecciona un proveedor para continuar con el pedido"
            maxWidth="lg"
            lockContentScroll
            contentSx={{ flex: 1, minHeight: 0 }}
        >
            <SearchInput
                placeholder="Buscar por nombre o ID"
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={18} color={theme.palette.text.secondary} />
                        </InputAdornment>
                    ),
                }}
            />
            <Card>
                {showSearchProgress ? (
                    <LinearProgress
                        aria-label="Buscando proveedores"
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                        }}
                    />
                ) : null}
                {isError && suppliers.length === 0 ? (
                    <StatusPane>
                        <Typography variant="body2" color="text.secondary">
                            No se pudieron cargar los proveedores
                        </Typography>
                        <Button color="primary" onClick={() => void refetch()}>
                            Reintentar
                        </Button>
                    </StatusPane>
                ) : showEmpty ? (
                    <StatusPane>
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron proveedores
                        </Typography>
                    </StatusPane>
                ) : (
                    <SuppliersList ref={listRef} aria-busy={isFetching}>
                        <SupplierListHeader>
                            <SupplierColumnLabel>ID</SupplierColumnLabel>
                            <SupplierColumnLabel>Proveedor</SupplierColumnLabel>
                            <span />
                        </SupplierListHeader>
                        {showInitialLoading ? (
                            <SupplierPlaceholderRows count={INITIAL_PLACEHOLDER_ROWS} />
                        ) : (
                            suppliers.map((supplier) => (
                                <SupplierListRow key={supplier.id}>
                                    <SupplierIdText>{supplier.id}</SupplierIdText>
                                    <SupplierNameText title={supplier.name}>{supplier.name}</SupplierNameText>
                                    <Button color="primary" onClick={() => handleSelect(supplier)}>
                                        Seleccionar
                                    </Button>
                                </SupplierListRow>
                            ))
                        )}
                        {isFetchingNextPage ? <SupplierPlaceholderRows count={2} /> : null}
                        <div ref={sentinelRef} style={{ height: 1 }} />
                        {isError && suppliers.length > 0 ? (
                            <ListNotice>
                                <Typography variant="body2" color="text.secondary">
                                    No se pudo cargar el resto de proveedores
                                </Typography>
                                <Button color="primary" onClick={() => void fetchNextPage()}>
                                    Reintentar
                                </Button>
                            </ListNotice>
                        ) : null}
                    </SuppliersList>
                )}
            </Card>
        </SideModal>
    );
}
