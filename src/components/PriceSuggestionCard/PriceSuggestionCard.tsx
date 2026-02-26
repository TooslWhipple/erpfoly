import numeral from "numeral";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  CardContainer,
  ProductRow,
  ProductImage,
  ProductInfo,
  ProductName,
  ProductSku,
  SuggestedPriceBlock,
  SuggestedPriceLabel,
  SuggestedPriceValue,
  ApplyButton,
  AlternativePrices,
  AlternativePriceItem,
} from "./styles";

// ============================================================================
// TYPES
// ============================================================================

export interface PriceSuggestionCardProps {
  item: PriceSuggestionItem;
  onApply?: (item: PriceSuggestionItem, price: number) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPrice(value: number): string {
  return numeral(value).format("$0,0.00");
}

function formatChange(percent: number, direction: "up" | "down"): string {
  const arrow = direction === "down" ? "▼" : "▲";
  return `${arrow} ${percent}%`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PriceSuggestionCard({ item, onApply }: PriceSuggestionCardProps) {
  const handleApply = () => {
    onApply?.(item, item.suggestedPrice);
  };

  const changeClass =
    item.direction === "down" ? "change-down" : "change-up";

  return (
    <CardContainer>
      <ProductRow>
        <ProductImage />
        <ProductInfo>
          <ProductName>{item.productName}</ProductName>
          <ProductSku>{item.sku}</ProductSku>
        </ProductInfo>
      </ProductRow>

      <SuggestedPriceLabel>Nuevo precio sugerido</SuggestedPriceLabel>
      <SuggestedPriceBlock>
        <SuggestedPriceValue>
          <span className="price">{formatPrice(item.suggestedPrice)}</span>
          <span className={`change ${changeClass}`}>
            {formatChange(item.changePercent, item.direction)}
          </span>
        </SuggestedPriceValue>
        <ApplyButton
          variant="contained"
          color="primary"
          size="small"
          onClick={handleApply}
        >
          Aplicar
        </ApplyButton>
      </SuggestedPriceBlock>

      {item.alternativePrices.length > 0 && (
        <AlternativePrices>
          {item.alternativePrices.map((alt, index) => (
            <AlternativePriceItem key={index} component="span">
              {formatPrice(alt.price)}{" "}
              <span className={alt.direction === "down" ? "down" : "up"}>
                {formatChange(alt.changePercent, alt.direction)}
              </span>
              {index < item.alternativePrices.length - 1 ? " · " : ""}
            </AlternativePriceItem>
          ))}
        </AlternativePrices>
      )}
    </CardContainer>
  );
}
