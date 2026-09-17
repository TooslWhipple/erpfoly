import { useState } from "react";
import {
  Box,
  Collapse,
  List,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  NavItemButton,
  NavItemIcon,
  SubItemButton,
  ExpandIcon,
  CollapseIcon,
} from "./styles";
import { isPathActive, isParentNavItemActive } from "./sidebar.utils";
import type { NavItem } from "./sidebarNav.config";

interface SidebarNavListProps {
  items: NavItem[];
  pathname: string;
  openMenus: Record<string, boolean>;
  collapsed?: boolean;
  onNavigate: (path: string) => void;
  onToggleMenu: (label: string) => void;
}

export function SidebarNavList({
  items,
  pathname,
  openMenus,
  collapsed = false,
  onNavigate,
  onToggleMenu,
}: SidebarNavListProps) {
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    item: NavItem;
  } | null>(null);

  const handleCloseSubmenu = () => setMenuAnchor(null);

  return (
    <>
      <List component="nav" disablePadding>
        {items.map((item) => {
          const hasSubItems = Boolean(item.subItems?.length);
          const isOpen = openMenus[item.label] ?? false;
          const active = isParentNavItemActive(item, pathname, items);
          const subPaths = hasSubItems ? item.subItems!.map((sub) => sub.path) : [];

          const button = (
            <NavItemButton
              active={active}
              hasSubItems={hasSubItems}
              collapsed={collapsed}
              onClick={(event) => {
                if (hasSubItems) {
                  if (collapsed) {
                    setMenuAnchor({ el: event.currentTarget, item });
                    return;
                  }
                  onToggleMenu(item.label);
                  return;
                }
                onNavigate(item.path);
              }}
            >
              <NavItemIcon active={active} collapsed={collapsed}>
                {item.icon}
              </NavItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: "body1",
                    noWrap: true,
                  }}
                />
              )}
              {!collapsed && hasSubItems && (isOpen ? <CollapseIcon /> : <ExpandIcon />)}
            </NavItemButton>
          );

          const submenuOpen =
            collapsed && menuAnchor?.item.label === item.label;

          return (
            <Box key={item.label}>
              {collapsed ? (
                <Tooltip
                  title={item.label}
                  placement="right"
                  arrow
                  disableHoverListener={submenuOpen}
                >
                  <Box>{button}</Box>
                </Tooltip>
              ) : (
                button
              )}

              {!collapsed && hasSubItems && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems!.map((subItem) => {
                      const subActive = isPathActive(subItem.path, pathname, subPaths);
                      return (
                        <SubItemButton
                          key={subItem.path}
                          active={subActive}
                          onClick={() => onNavigate(subItem.path)}
                        >
                          <ListItemText
                            primary={subItem.label}
                            primaryTypographyProps={{
                              variant: "body1",
                              noWrap: true,
                            }}
                          />
                        </SubItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      <Menu
        anchorEl={menuAnchor?.el ?? null}
        open={Boolean(menuAnchor)}
        onClose={handleCloseSubmenu}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {menuAnchor?.item.subItems?.map((subItem) => {
          const subPaths = menuAnchor.item.subItems!.map((sub) => sub.path);
          const subActive = isPathActive(subItem.path, pathname, subPaths);
          return (
            <MenuItem
              key={subItem.path}
              selected={subActive}
              onClick={() => {
                handleCloseSubmenu();
                onNavigate(subItem.path);
              }}
            >
              {subItem.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
