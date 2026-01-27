import { InputAdornment, MenuItem, Select, SelectChangeEvent, Button, TextField } from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";
import {
  Container,
  TabsWrapper,
  StyledTabs,
  StyledTab,
  SearchContainer,
  SearchIconStyled,
  FiltersRightSection,
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
            <Select
              size="small"
              value={selectFilter.value}
              onChange={handleSelectChange}
              displayEmpty
              sx={{
                minWidth: 140,
                backgroundColor: colors.background.sidebar,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.sidebar.textSelected,
                },
                "@media (max-width: 899px)": {
                  width: "100%",
                },
              }}
            >
              {selectFilter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          )}
          {showSearch && (
            <SearchContainer singleAction={singleAction}>
              <TextField
                size="small"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                fullWidth={!singleAction}
                sx={{
                  width: 280,
                  "@media (max-width: 899px)": {
                    width: singleAction ? "auto" : "100%",
                    minWidth: singleAction ? 200 : "auto",
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.background.sidebar,
                    "& fieldset": {
                      borderColor: colors.border,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.border,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.sidebar.textSelected,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ width: 18, height: 18, color: "#71717A" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </SearchContainer>
          )}
          {hasActions && actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant ?? "contained"}
              color={action.color ?? "primary"}
              onClick={action.onClick}
              disabled={action.disabled}
              startIcon={action.showIcon ? <AddIcon /> : undefined}
              sx={{
                height: 40,
                minWidth: 100,
                textTransform: "none",
                fontWeight: 500,
                flexShrink: 0,
                marginBottom: (theme) => theme.spacing(1),
                "@media (max-width: 899px)": {
                  marginBottom: 0,
                  ...(singleAction && {
                    flexShrink: 0,
                    marginLeft: (theme) => theme.spacing(1.5),
                  }),
                  ...(multipleActions && {
                    flex: "1 1 calc(50% - 8px)",
                    minWidth: "calc(50% - 8px)",
                  }),
                },
              }}
            >
              {action.label}
            </Button>
          ))}
        </FiltersRightSection>
      )}
    </Container>
  );
}
