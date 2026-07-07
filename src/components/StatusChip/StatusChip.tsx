import { StyledStatusChip } from "./styles";
import type { StatusChipVariant, StatusChipSize } from "./styles";

export interface StatusChipProps {
  label: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: StatusChipVariant;
  size?: StatusChipSize;
  backgroundColor?: string;
  color?: string;
  className?: string;
  id?: string;
}

export function StatusChip({
  label,
  startIcon,
  endIcon,
  variant = "default",
  size = "default",
  backgroundColor,
  color,
  className,
  id,
}: StatusChipProps) {
  const hasStartIcon = startIcon != null;
  const hasEndIcon = endIcon != null;

  return (
    <StyledStatusChip
      variant={variant}
      size={size}
      hasStartIcon={hasStartIcon}
      hasEndIcon={hasEndIcon}
      backgroundColor={backgroundColor}
      color={color}
      className={className}
      id={id}>
      {hasStartIcon && <span className="status-chip-icon">{startIcon}</span>}
      <span className="status-chip-label">{label}</span>
      {hasEndIcon && <span className="status-chip-icon">{endIcon}</span>}
    </StyledStatusChip>
  );
}
