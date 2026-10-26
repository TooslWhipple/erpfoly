export const OUTSIDE_ZONE_LABEL = "Fuera de zona";
export const UNKNOWN_ZONE_LABEL = "Sin zona";

export type ZonedItem = {
  id: string;
  zone: string;
  zoneId?: number | null;
  zoneColor?: string | null;
};

export type ZoneGroup<T extends ZonedItem> = {
  key: string;
  label: string;
  color: string | null;
  items: T[];
};

export function zoneGroupKey(item: ZonedItem): string {
  if (item.zoneId != null) return `id:${item.zoneId}`;
  return `label:${item.zone}`;
}

function zoneSortRank(label: string): number {
  if (label === UNKNOWN_ZONE_LABEL) return 2;
  if (label === OUTSIDE_ZONE_LABEL) return 1;
  return 0;
}

export function groupItemsByZone<T extends ZonedItem>(items: T[]): ZoneGroup<T>[] {
  const groups = new Map<string, ZoneGroup<T>>();

  for (const item of items) {
    const key = zoneGroupKey(item);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
      if (!existing.color && item.zoneColor) {
        existing.color = item.zoneColor;
      }
      continue;
    }
    groups.set(key, {
      key,
      label: item.zone,
      color: item.zoneColor ?? null,
      items: [item],
    });
  }

  return [...groups.values()].sort((left, right) => {
    const byRank = zoneSortRank(left.label) - zoneSortRank(right.label);
    if (byRank !== 0) return byRank;
    return left.label.localeCompare(right.label, "es");
  });
}

export function matchesOrderSearch(
  item: {
    orderNumber: string;
    sku?: string;
    articleName?: string;
    zone: string;
  },
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    item.orderNumber.toLowerCase().includes(normalized) ||
    (item.sku?.toLowerCase().includes(normalized) ?? false) ||
    (item.articleName?.toLowerCase().includes(normalized) ?? false) ||
    item.zone.toLowerCase().includes(normalized)
  );
}
