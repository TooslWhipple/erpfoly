import { InputAdornment, Button, Grid } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { theme } from "@/styles/theme";
import { usePermissions } from "@/hooks/usePermissions";
import type { ReactNode } from "react";
import { TabsWrapper, StyledTabs, StyledTab } from "./styles";
import { FormTextField } from "../Form";
import { Search } from "lucide-react";

export interface TabOption {
  label: ReactNode;
  value: string;
  count?: number;
  textColor?: string;
}

export interface SelectFilterOption {
  label: string;
  value: string;
}

export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained" | "option" | "white";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success" | "inherit";
  showIcon?: boolean;
  disabled?: boolean;
  permission?: string;
}

type TabFiltersLayout = "default" | "contained" | "fullWidth";

interface TabFiltersProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  /** contained: horizontal scroll inside a narrow panel; fullWidth: equal-width row. */
  layout?: TabFiltersLayout;
  disabled?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selectFilter?: {
    options: SelectFilterOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
  };
  actions?: ActionButtonConfig[];
}

function formatTabLabel(tab: TabOption): ReactNode {
  return tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label;
}

function formatTabLabelText(tab: TabOption): string {
  const base = typeof tab.label === "string" ? tab.label : String(tab.label);
  return tab.count !== undefined ? `${base} (${tab.count})` : base;
}

function HorizontalTabs({
  tabs,
  activeTab,
  onTabChange,
  disabled,
  layout,
}: {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  disabled: boolean;
  layout: TabFiltersLayout;
}) {
  const isFullWidthLayout = layout === "fullWidth";
  const isContainedLayout = layout === "contained";

  return (
    <TabsWrapper contained={isContainedLayout} fullWidth={isFullWidthLayout}>
      <StyledTabs
        value={activeTab}
        onChange={(_, newValue) => {
          if (disabled) return;
          onTabChange(newValue);
        }}
        variant={isFullWidthLayout ? "fullWidth" : "scrollable"}
        scrollButtons={false}
        fullWidth={isFullWidthLayout}
        sx={disabled ? { pointerEvents: "none", opacity: 0.6 } : undefined}
      >
        {tabs.map((tab) => (
          <StyledTab
            key={tab.value}
            dense={isContainedLayout}
            equalWidth={isFullWidthLayout}
            label={formatTabLabel(tab)}
            value={tab.value}
            title={formatTabLabelText(tab)}
            sx={
              tab.textColor
                ? { color: tab.textColor, "&.Mui-selected": { color: tab.textColor } }
                : undefined
            }
          />
        ))}
      </StyledTabs>
    </TabsWrapper>
  );
}

export function TabFilters({
  tabs,
  activeTab,
  onTabChange,
  layout = "default",
  disabled = false,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar",
  actions,
}: TabFiltersProps) {
  const { hasPermission } = usePermissions();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const visibleActions = actions?.filter(
    (action) => !action.permission || hasPermission(action.permission),
  );
  const hasActions = visibleActions && visibleActions.length > 0;
  const singleAction = hasActions && visibleActions.length === 1;
  const isContainedLayout = layout === "contained";
  const hasToolbarExtras = showSearch || hasActions;

  if (tabs.length > 0 && isContainedLayout && !hasToolbarExtras) {
    return (
      <HorizontalTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        disabled={disabled}
        layout={layout}
      />
    );
  }

  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      justifyContent={{ xs: "flex-start", md: "space-between" }}
      wrap="wrap"
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        flexWrap: "wrap",
      }}
    >
      <Grid
        size={{ xs: 12, md: isContainedLayout ? 12 : "auto" }}
        sx={{
          minWidth: 0,
          maxWidth: "100%",
          flexShrink: 1,
          overflow: isContainedLayout ? "visible" : "hidden",
        }}
      >
        {tabs.length > 0 && (
          <HorizontalTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            disabled={disabled}
            layout={layout}
          />
        )}
      </Grid>

      <Grid
        container
        size={{ xs: 12, md: "auto" }}
        alignContent={{ xs: "flex-start", md: "flex-end" }}
        sx={{
          minWidth: 0,
          maxWidth: "100%",
          flexShrink: 1,
          justifyContent: { xs: "flex-start", md: "flex-end" },
        }}
      >
        {showSearch && (
          <Grid size={{ xs: 12, sm: 6, md: "auto" }} sx={{ minWidth: 0, maxWidth: "100%" }}>
            <FormTextField
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              fullWidth={!singleAction}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        {hasActions &&
          visibleActions.map((action, index) => (
            <Grid
              key={`${action.label}-${index}`}
              size={{ xs: 12, sm: 6, md: "auto" }}
              sx={{ minWidth: 0, maxWidth: "100%" }}
            >
              <Button
                fullWidth
                variant={action.variant ?? "contained"}
                color={action.color ?? "primary"}
                onClick={action.onClick}
                disabled={action.disabled}
                startIcon={action.showIcon ? <AddIcon /> : undefined}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
      </Grid>
    </Grid>
  );
}
