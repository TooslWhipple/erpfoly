import { useState, useRef } from "react";
import {
  Button,
  Popover,
  Divider,
  useTheme,
} from "@mui/material";
import { FilterList as FilterIcon } from "@mui/icons-material";
import {
  ClearButton,
  MenuContainer,
  MenuHeader,
  MenuTitle,
  OptionLabel,
  OptionsList,
  StyledCheckbox,
  StyledListItem,
  StyledListItemButton,
} from "./FilterMenu.styles";

export interface FilterOption {
  id: string | number;
  label: string;
}

export interface FilterMenuProps {
  label: string;
  title: string;
  options: FilterOption[];
  selectedIds: (string | number)[];
  onChange: (selectedIds: (string | number)[]) => void;
  allOptionId?: string | number;
  allOptionLabel?: string;
  disabled?: boolean;
}

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

  const isAllSelected = selectedIds.includes(allOptionId);
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
      onChange([]);
    } else {
      const allOptionIds = options.filter((opt) => opt.id !== allOptionId).map((opt) => opt.id);
      onChange([allOptionId, ...allOptionIds]);
    }
  };

  const handleToggleOption = (optionId: string | number) => {
    if (optionId === allOptionId) {
      handleToggleAll();
      return;
    }

    const currentSelection = selectedIds.filter((id) => id !== allOptionId);
    const isCurrentlySelected = currentSelection.includes(optionId);

    const newSelectedIds = isCurrentlySelected
      ? currentSelection.filter((id) => id !== optionId)
      : [...currentSelection, optionId];

    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;

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
      if (labelText.includes("sucursales")) {
        return "Todas las sucursales";
      }
      if (labelText.includes("departamentos")) {
        return "Todos los departamentos";
      }
      return `Todas las ${labelText}`;
    }
    if (selectedWithoutAll.length === 0) {
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

    const isAllSelectedState = isAllSelected || (selectedWithoutAll.length === totalOptions && totalOptions > 0) || selectedWithoutAll.length === 0;

    if (!isAllSelectedState) {
      return false;
    }

    return labelText.includes("sucursales") || labelText.includes("departamentos");
  };

  const showingAll = isShowingAllOption();
  const app = theme.palette.app;

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
          backgroundColor: showingAll ? app.background.sidebar : "transparent",
          color: showingAll ? theme.palette.text.secondary : theme.palette.text.primary,
          borderColor: app.border,
          "&:hover": {
            borderColor: app.sidebar.textSelected,
            backgroundColor: app.background.sidebar,
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
