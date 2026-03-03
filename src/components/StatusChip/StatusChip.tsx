import { StyledStatusChip } from "./styles";
import type { StatusChipVariant, StatusChipSize } from "./styles";

export interface StatusChipProps {
  /** Chip text content */
  label: string;
  /** Icon before the label */
  startIcon?: React.ReactNode;
  /** Icon after the label */
  endIcon?: React.ReactNode;
  /** Visual variant */
  variant?: StatusChipVariant;
  /** Size: default (40px height) or small (24px height) */
  size?: StatusChipSize;
  /** Override background color (ignored when variant is used for styling) */
  backgroundColor?: string;
  /** Override text color */
  color?: string;
  /** Optional className for external overrides */
  className?: string;
  /** Optional id for accessibility or testing */
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
