import { StyledStatusChip } from "./styles";
import type { StatusChipVariant } from "./styles";

export interface StatusChipProps {
  /** Chip text content */
  label: string;
  /** Icon before the label */
  startIcon?: React.ReactNode;
  /** Icon after the label */
  endIcon?: React.ReactNode;
  /** Visual variant */
  variant?: StatusChipVariant;
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
  className,
  id,
}: StatusChipProps) {
  return (
    <StyledStatusChip variant={variant} className={className} id={id}>
      {startIcon}
      <span>{label}</span>
      {endIcon}
    </StyledStatusChip>
  );
}
