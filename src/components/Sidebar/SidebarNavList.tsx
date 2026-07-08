import { Box, Collapse, List, ListItemText } from "@mui/material";
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
  onNavigate: (path: string) => void;
  onToggleMenu: (label: string) => void;
}

export function SidebarNavList({
  items,
  pathname,
  openMenus,
  onNavigate,
  onToggleMenu,
}: SidebarNavListProps) {
  return (
    <List component="nav" disablePadding>
      {items.map((item) => {
        const hasSubItems = Boolean(item.subItems?.length);
        const isOpen = openMenus[item.label] ?? false;
        const active = isParentNavItemActive(item, pathname, items);
        const subPaths = hasSubItems ? item.subItems!.map((sub) => sub.path) : [];

        return (
          <Box key={item.label}>
            <NavItemButton
              active={active}
              hasSubItems={hasSubItems}
              onClick={() => {
                if (hasSubItems) {
                  onToggleMenu(item.label);
                  return;
                }
                onNavigate(item.path);
              }}>
              <NavItemIcon active={active}>{item.icon}</NavItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: "body1",
                  noWrap: true,
                }}
              />
              {hasSubItems && (isOpen ? <CollapseIcon /> : <ExpandIcon />)}
            </NavItemButton>

            {hasSubItems && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems!.map((subItem) => {
                    const subActive = isPathActive(subItem.path, pathname, subPaths);
                    return (
                      <SubItemButton
                        key={subItem.path}
                        active={subActive}
                        onClick={() => onNavigate(subItem.path)}>
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
  );
}
