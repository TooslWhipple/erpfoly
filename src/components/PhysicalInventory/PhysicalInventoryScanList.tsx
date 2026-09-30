"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { PhysicalInventoryScanItemRow } from "@/components/PhysicalInventory/PhysicalInventoryScanItemRow";
import type { PhysicalInventoryItem } from "@/types/physical-inventory.types";

const ROW_HEIGHT = 64;
const OVERSCAN = 8;

export interface PhysicalInventoryScanListProps {
  items: PhysicalInventoryItem[];
  onChangeQuantity: (
    productId: number,
    quantity: number,
    base?: PhysicalInventoryItem,
  ) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function PhysicalInventoryScanList({
  items,
  onChangeQuantity,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: PhysicalInventoryScanListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(480);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => setViewportHeight(el.clientHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalHeight = items.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [endIndex, items, startIndex],
  );

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      setScrollTop(target.scrollTop);

      const remaining =
        target.scrollHeight - target.scrollTop - target.clientHeight;
      if (remaining < ROW_HEIGHT * 4 && hasNextPage && !isFetchingNextPage) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore],
  );

  return (
    <Stack
      sx={{
        maxHeight: { lg: "calc(100vh - 260px)" },
        minHeight: 240,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ px: 1, pb: 1 }}
        alignItems="center"
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ width: 18 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: 36, textAlign: "center" }}
        >
          Cant.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flex: 1 }}
        >
          Artículo
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ width: 96, textAlign: "center" }}
        >
          Inventario
        </Typography>
      </Stack>

      <Stack
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <Stack sx={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map((item, offset) => {
            const index = startIndex + offset;
            return (
              <Stack
                key={item.productId}
                sx={{
                  position: "absolute",
                  top: index * ROW_HEIGHT,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                }}
              >
                <PhysicalInventoryScanItemRow
                  item={item}
                  onChangeQuantity={(productId, quantity) =>
                    onChangeQuantity(productId, quantity, item)
                  }
                />
              </Stack>
            );
          })}
        </Stack>

        {(isFetchingNextPage || hasNextPage) && (
          <Stack alignItems="center" py={1.5}>
            {isFetchingNextPage ? (
              <CircularProgress size={22} />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Desplaza para cargar más
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
