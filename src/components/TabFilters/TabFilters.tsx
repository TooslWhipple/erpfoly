import { InputAdornment } from "@mui/material";
import {
  Container,
  TabsWrapper,
  StyledTabs,
  StyledTab,
  SearchContainer,
  SearchInput,
  SearchIconStyled,
} from "./styles";

export interface TabOption {
  label: string;
  value: string;
  count?: number;
}

interface TabFiltersProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function TabFilters({
  tabs,
  activeTab,
  onTabChange,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
}: TabFiltersProps) {
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

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
    </Container>
  );
}
