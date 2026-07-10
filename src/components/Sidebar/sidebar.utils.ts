import type { User } from "@/store/useAuthStore";
import { hasAccessRequirement } from "@/lib/routeAccess";
import type { NavItem } from "./sidebarNav.config";

export const getInitialOpenMenus = (pathname: string, items: NavItem[]): Record<string, boolean> => {
  const menus: Record<string, boolean> = {};
  items.forEach((item) => {
    if (item.subItems) {
      const isInSubItem = item.subItems.some(
        (sub) => pathname === sub.path || pathname.startsWith(sub.path + "/")
      );
      if (isInSubItem) {
        menus[item.label] = true;
      }
    }
  });
  return menus;
};

export const getInitials = (name?: string | null): string => {
  if (!name) return "US";
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "US";
};

export const isPathActive = (path: string, pathname: string, siblingPaths: string[] = []): boolean => {
  const pathMatches = pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatches) return false;

  const hasMoreSpecificMatch = siblingPaths.some((otherPath) => {
    if (otherPath === path || otherPath.length <= path.length) return false;
    return pathname === otherPath || pathname.startsWith(`${otherPath}/`);
  });

  return !hasMoreSpecificMatch;
};

export const filterNavItemsByAccess = (items: NavItem[], user: User | null): NavItem[] =>
  items
    .map((item) => {
      const subItems = item.subItems?.filter((subItem) => hasAccessRequirement(user, subItem.requirement));
      const canAccessItem = item.requirement ? hasAccessRequirement(user, item.requirement) : false;

      if (item.subItems) {
        if (!canAccessItem && (!subItems || subItems.length === 0)) return null;
        return { ...item, subItems };
      }

      return canAccessItem ? item : null;
    })
    .filter((item): item is NavItem => item !== null);

export const isParentNavItemActive = (item: NavItem, pathname: string, visibleNavItems: NavItem[]): boolean => {
  if (item.subItems) {
    const subPaths = item.subItems.map((sub) => sub.path);
    return item.subItems.some((sub) => isPathActive(sub.path, pathname, subPaths));
  }

  const siblingPaths = visibleNavItems.filter((other) => !other.subItems).map((other) => other.path);
  return isPathActive(item.path, pathname, siblingPaths);
};
