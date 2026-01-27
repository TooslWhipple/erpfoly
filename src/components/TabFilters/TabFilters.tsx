import { InputAdornment, MenuItem, Select, SelectChangeEvent, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import {
  Container,
  TabsWrapper,
  StyledTabs,
  StyledTab,
  SearchContainer,
  SearchInput,
  SearchIconStyled,
  FiltersRightSection,
  StyledSelect,
  ActionButton,
} from "./styles";

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
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: "text" | "outlined" | "contained";
  /** Button color */
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  /** Show add icon */
  showIcon?: boolean;
  /** Disabled state */
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
  /** Action buttons configuration */
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
  const showRightSection = showSearch || selectFilter || hasActions;
  const singleAction = hasActions && actions.length === 1;
  const multipleActions = hasActions && actions.length > 1;

  return (
    <Container>
      <TabsWrapper>
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons={false}
        >
          {tabs.map((tab) => (
            <StyledTab
              key={tab.value}
              label={
                tab.count !== undefined
                  ? `${tab.label} (${tab.count})`
                  : tab.label
              }
              value={tab.value}
            />
          ))}
        </StyledTabs>
      </TabsWrapper>

      {showRightSection && (
        <FiltersRightSection singleAction={singleAction}>
          {selectFilter && (
            <StyledSelect
              size="small"
              value={selectFilter.value}
              onChange={handleSelectChange}
              displayEmpty
            >
              {selectFilter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </StyledSelect>
          )}
          {showSearch && (
            <SearchContainer singleAction={singleAction}>
              <SearchInput
                size="small"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                fullWidth={!singleAction}
                singleAction={singleAction}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIconStyled />
                    </InputAdornment>
                  ),
                }}
              />
            </SearchContainer>
          )}
          {hasActions && actions.map((action, index) => (
            <ActionButton
              key={index}
              variant={action.variant ?? "contained"}
              color={action.color ?? "primary"}
              onClick={action.onClick}
              disabled={action.disabled}
              startIcon={action.showIcon ? <AddIcon /> : undefined}
              singleAction={singleAction}
              multipleActions={multipleActions}
            >
              {action.label}
            </ActionButton>
          ))}
        </FiltersRightSection>
      )}
    </Container>
  );
}
