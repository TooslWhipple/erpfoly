import { useState, useRef } from "react";
import {
  Box,
  Checkbox,
  Typography,
  Button,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import { FilterList as FilterIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FilterOption {
  id: string | number;
  label: string;
}

export interface FilterMenuProps {
  /** Button label */
  label: string;
  /** Title shown in the menu header */
  title: string;
  /** All available filter options */
  options: FilterOption[];
  /** Currently selected option IDs */
  selectedIds: (string | number)[];
  /** Callback when selection changes */
  onChange: (selectedIds: (string | number)[]) => void;
  /** ID for the "All" option (default: "all") */
  allOptionId?: string | number;
  /** Label for the "All" option (default: "Todos" or "Todas") */
  allOptionLabel?: string;
  /** Disable the filter */
  disabled?: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const MenuContainer = styled(Box)({
  minWidth: 280,
  maxWidth: 320,
  backgroundColor: colors.background.sidebar,
});

const MenuHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${colors.border}`,
}));

const MenuTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const ClearButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: "4px 8px",
  fontSize: "0.875rem",
  fontWeight: 400,
  color: theme.palette.text.secondary,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "transparent",
    color: colors.sidebar.textSelected,
  },
}));

const OptionsList = styled(List)({
  padding: 0,
  maxHeight: 400,
  overflowY: "auto",
});

const StyledListItem = styled(ListItem)({
  padding: 0,
});

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  "&:hover": {
    backgroundColor: colors.background.main,
  },
}));

const StyledCheckbox = styled(Checkbox)({
  padding: "4px",
  color: colors.border,
  "&.Mui-checked": {
    color: colors.sidebar.textSelected,
  },
});

const OptionLabel = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.primary,
  },
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function FilterMenu({
  label,
  title,
  options,
  selectedIds,
  onChange,
  allOptionId = "all",
  allOptionLabel = "Todos",
  disabled = false,
}: FilterMenuProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const open = Boolean(anchorEl);
  const allOption: FilterOption = { id: allOptionId, label: allOptionLabel };

  // Check if "All" is selected
  const isAllSelected = selectedIds.includes(allOptionId);
  // Check if all options (except "All") are selected
  const areAllOptionsSelected =
    selectedIds.length > 0 &&
    selectedIds.filter((id) => id !== allOptionId).length ===
      options.filter((opt) => opt.id !== allOptionId).length;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      // Deselect all
      onChange([]);
    } else {
      // Select all options (including "All" option)
      const allOptionIds = options.filter((opt) => opt.id !== allOptionId).map((opt) => opt.id);
      onChange([allOptionId, ...allOptionIds]);
    }
  };

  const handleToggleOption = (optionId: string | number) => {
    if (optionId === allOptionId) {
      handleToggleAll();
      return;
    }

    // Remove "All" from selection if it exists
    const currentSelection = selectedIds.filter((id) => id !== allOptionId);
    const isCurrentlySelected = currentSelection.includes(optionId);
    
    const newSelectedIds = isCurrentlySelected
      ? currentSelection.filter((id) => id !== optionId)
      : [...currentSelection, optionId];

    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;

    // If all options are selected, also select "All"
    if (newSelectedIds.length === totalOptions) {
      onChange([allOptionId, ...newSelectedIds]);
    } else {
      onChange(newSelectedIds);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getButtonLabel = () => {
    const selectedWithoutAll = selectedIds.filter((id) => id !== allOptionId);
    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;
    const labelText = label.toLowerCase();

    if (isAllSelected || (selectedWithoutAll.length === totalOptions && totalOptions > 0)) {
      // Show "Todas las sucursales" or "Todos los departamentos"
      if (labelText.includes("sucursales")) {
        return "Todas las sucursales";
      }
      if (labelText.includes("departamentos")) {
        return "Todos los departamentos";
      }
      return `Todas las ${labelText}`;
    }
    if (selectedWithoutAll.length === 0) {
      // Show base label when nothing is selected
      if (labelText.includes("sucursales")) {
        return "Todas las sucursales";
      }
      if (labelText.includes("departamentos")) {
        return "Todos los departamentos";
      }
      return label;
    }
    if (selectedWithoutAll.length === 1) {
      const selected = options.find((opt) => opt.id === selectedWithoutAll[0]);
      return selected?.label || label;
    }
    return `${selectedWithoutAll.length} seleccionadas`;
  };

  const isShowingAllOption = () => {
    const selectedWithoutAll = selectedIds.filter((id) => id !== allOptionId);
    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;
    const labelText = label.toLowerCase();

    // Check if showing "Todas las sucursales" or "Todos los departamentos"
    const isAllSelectedState = isAllSelected || (selectedWithoutAll.length === totalOptions && totalOptions > 0) || selectedWithoutAll.length === 0;
    
    if (!isAllSelectedState) {
      return false;
    }

    // Only apply special styling for "sucursales" and "departamentos"
    return labelText.includes("sucursales") || labelText.includes("departamentos");
  };

  const showingAll = isShowingAllOption();

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outlined"
        startIcon={<FilterIcon />}
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          height: 40,
          whiteSpace: "nowrap",
          textTransform: "none",
          backgroundColor: showingAll ? colors.background.sidebar : "transparent",
          color: showingAll ? theme.palette.text.secondary : theme.palette.text.primary,
          borderColor: colors.border,
          "&:hover": {
            borderColor: colors.sidebar.textSelected,
            backgroundColor: showingAll ? colors.background.sidebar : colors.background.sidebar,
          },
        }}
      >
        {getButtonLabel()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            marginTop: "8px",
          },
        }}
      >
        <MenuContainer>
          <MenuHeader>
            <MenuTitle>{title}</MenuTitle>
            <ClearButton onClick={handleClear} disabled={selectedIds.length === 0}>
              Limpiar
            </ClearButton>
          </MenuHeader>

          <Divider />

          <OptionsList>
            <StyledListItem disablePadding>
              <StyledListItemButton onClick={handleToggleAll}>
                <StyledCheckbox
                  checked={isAllSelected}
                  indeterminate={areAllOptionsSelected && !isAllSelected}
                />
                <OptionLabel primary={allOptionLabel} />
              </StyledListItemButton>
            </StyledListItem>

            {options
              .filter((opt) => opt.id !== allOptionId)
              .map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <StyledListItem key={option.id} disablePadding>
                    <StyledListItemButton onClick={() => handleToggleOption(option.id)}>
                      <StyledCheckbox checked={isSelected} />
                      <OptionLabel primary={option.label} />
                    </StyledListItemButton>
                  </StyledListItem>
                );
              })}
          </OptionsList>
        </MenuContainer>
      </Popover>
    </>
  );
}
