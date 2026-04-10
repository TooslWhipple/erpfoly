import { InputAdornment, SelectChangeEvent, Button, Grid } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";
import {
  TabsWrapper,
  StyledTabs,
  StyledTab
} from "./styles";
import { FormTextField } from "../Form";
import { Search } from "lucide-react";

export interface TabOption {
  label: string;
  value: string;
  count?: number;
}

export interface SelectFilterOption {
  label: string;
  value: string;
}

export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  showIcon?: boolean;
  disabled?: boolean;
}

interface TabFiltersProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
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

export function TabFilters({
  tabs,
  activeTab,
  onTabChange,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  selectFilter,
  actions,
}: TabFiltersProps) {
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    selectFilter?.onChange(event.target.value);
  };

  const hasActions = actions && actions.length > 0;
  const singleAction = hasActions && actions.length === 1;

  return (
    <Grid container spacing={2} alignItems="center" justifyContent={{ xs: "flex-start", md: "space-between" }}>
      <Grid size={{ xs: 12, md: 'auto' }}>
        {
          tabs.length > 0 &&
          <TabsWrapper>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons={false}
            >
              {
                tabs.map((tab) => (
                  <StyledTab
                    key={tab.value}
                    label={
                      tab.count !== undefined
                        ? `${tab.label} (${tab.count})`
                        : tab.label
                    }
                    value={tab.value}
                  />
                ))
              }
            </StyledTabs>
          </TabsWrapper>
        }
      </Grid>

      <Grid container size={{ xs: 12, md: 'auto' }} alignContent={{ xs: 'flex-start', md: 'flex-end' }}>
        {
          showSearch &&
          <Grid size={{ xs: 6, md: 'auto' }}>
            <FormTextField
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              fullWidth={!singleAction}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={colors.text.secondary} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        }
        {
          hasActions && actions.map((action, index) => (
            <Grid size={{ xs: 6, md: 'auto' }}>
              <Button
                fullWidth
                key={index}
                variant={action.variant ?? "contained"}
                color={action.color ?? "primary"}
                onClick={action.onClick}
                disabled={action.disabled}
                startIcon={action.showIcon ? <AddIcon /> : undefined}>
                {action.label}
              </Button>
            </Grid>
          ))
        }
      </Grid>
    </Grid>
  );
}
