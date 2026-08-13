import { useState } from "react";
import { Button, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { Building2, ChevronDown } from "lucide-react";
import { theme } from "@/styles/theme";

export interface InlineBranchOption {
  id: number;
  name: string;
}

export interface InlineBranchSelectProps {
  label?: string;
  value: number | null;
  options: InlineBranchOption[];
  onChange: (branchId: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InlineBranchSelect({
  label = "Sucursal",
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
}: InlineBranchSelectProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const selected = options.find((opt) => opt.id === value);
  const displayName = selected?.name ?? "Sin sucursal";

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled || loading) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (branchId: number) => {
    handleClose();
    if (branchId !== value) {
      onChange(branchId);
    }
  };

  return (
    <>
      <Button
        variant="text"
        color="inherit"
        disableRipple
        disabled={disabled || loading}
        onClick={handleOpen}
        sx={{
          alignSelf: "flex-start",
          px: 0,
          py: 0.25,
          minWidth: 0,
          textTransform: "none",
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "transparent",
          },
          "&.Mui-disabled": {
            opacity: 0.6,
          },
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Building2 size={16} color={theme.palette.text.secondary} />
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {loading ? "Guardando…" : displayName}
          </Typography>
          <ChevronDown size={14} color={theme.palette.text.secondary} />
        </Stack>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.id}
            selected={option.id === value}
            onClick={() => handleSelect(option.id)}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
