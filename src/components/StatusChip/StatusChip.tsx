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
  return (
    <StyledStatusChip
      variant={variant}
      size={size}
      backgroundColor={backgroundColor}
      color={color}
      className={className}
      id={id}
    >
      {startIcon}
      <span>{label}</span>
      {endIcon}
    </StyledStatusChip>
  );
}
