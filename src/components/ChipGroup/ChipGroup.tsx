import { Tooltip } from "@mui/material";
import { ChipGroupContainer, StyledChip, MoreChip } from "./styles";

export interface ChipGroupProps {
  items: string[];
  maxVisible?: number;
  onClick?: (item: string) => void;
}

export function ChipGroup({ items, maxVisible = 6, onClick }: ChipGroupProps) {
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;
  const hasMore = remainingCount > 0;
  const remainingItems = items.slice(maxVisible);

  return (
    <ChipGroupContainer>
      {visibleItems.map((item, index) => (
        <StyledChip
          key={`${item}-${index}`}
          label={item}
          size="small"
          onClick={onClick ? () => onClick(item) : undefined}
          clickable={!!onClick}
        />
      ))}
      {hasMore && (
        <Tooltip title={remainingItems.join(", ")} arrow>
          <MoreChip label={`+${remainingCount}`} size="small" />
        </Tooltip>
      )}
    </ChipGroupContainer>
  );
}
