import { InputAdornment, MenuItem, Select, SelectChangeEvent } from "@mui/material";
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
  /** Additional actions to render on the right side (e.g., buttons) */
  actions?: React.ReactNode;
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

  const showRightSection = showSearch || selectFilter || actions;

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
        <FiltersRightSection>
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
            <SearchContainer>
              <SearchInput
                size="small"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                fullWidth
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
          {actions}
        </FiltersRightSection>
      )}
    </Container>
  );
}
