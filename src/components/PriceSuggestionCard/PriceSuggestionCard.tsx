import numeral from "numeral";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  CardContainer,
  ProductImage,
  PriceListContainer,
  PriceListItem,
  TimelineColumn,
  TimelineDot,
  TimelineLine,
  PriceRow,
  PriceRowContent,
  PriceAmount,
  PriceChange,
  ApplyButton,
} from "./styles";
import { Stack, Typography } from "@mui/material";

export interface PriceSuggestionCardProps {
  item: PriceSuggestionItem;
  onApply?: (item: PriceSuggestionItem, price: number) => void;
}

interface PriceRowData {
  price: number;
  changePercent: number;
  direction: "up" | "down";
  isSuggested: boolean;
}

function formatPrice(value: number): string {
  return numeral(value).format("$0,0.00");
}

function buildPriceRows(item: PriceSuggestionItem): PriceRowData[] {
  const suggested: PriceRowData = {
    price: item.suggestedPrice,
    changePercent: item.changePercent,
    direction: item.direction,
    isSuggested: true,
  };
  const alternatives: PriceRowData[] = item.alternativePrices.map((alt) => ({
    price: alt.price,
    changePercent: alt.changePercent,
    direction: alt.direction,
    isSuggested: false,
  }));
  return [suggested, ...alternatives];
}

export function PriceSuggestionCard({ item, onApply }: PriceSuggestionCardProps) {
  const priceRows = buildPriceRows(item);

  const handleApply = () => {
    onApply?.(item, item.suggestedPrice);
  };

  return (
    <CardContainer>
      <Stack direction="row" spacing={1} alignItems="center">
        <ProductImage />
        <Stack>
          <Typography variant="body1" fontWeight={700}>{item.productName}</Typography>
          <Typography variant="caption">{item.sku}</Typography>
        </Stack>
      </Stack>

      <PriceListContainer>
        {priceRows.map((row, index) => (
          <PriceListItem key={index}>
            <TimelineColumn>
              <TimelineDot active={row.isSuggested} />
              {index < priceRows.length - 1 && <TimelineLine />}
            </TimelineColumn>
            <PriceRow highlighted={row.isSuggested}>
              <PriceRowContent>
                {
                  row.isSuggested &&
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>Nuevo precio sugerido</Typography>
                }
                <Stack direction="row" spacing={1} alignItems="center">
                  <PriceAmount active={row.isSuggested}>{formatPrice(row.price)}</PriceAmount>
                  <PriceChange active={row.isSuggested}>
                    {row.direction === "down" ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronUp size={14} />
                    )}
                    <span>{row.changePercent}%</span>
                  </PriceChange>
                </Stack>
              </PriceRowContent>
              {row.isSuggested && (
                <ApplyButton
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleApply}
                >
                  Aplicar
                </ApplyButton>
              )}
            </PriceRow>
          </PriceListItem>
        ))}
      </PriceListContainer>
    </CardContainer>
  );
}
