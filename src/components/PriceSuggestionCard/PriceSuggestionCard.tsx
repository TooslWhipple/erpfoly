import numeral from "numeral";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { PriceSuggestionItem } from "@/types/liquidaciones.types";
import {
  CardContainer,
  ProductImage,
  ImagePlaceholder,
  PriceList,
  PriceListItem,
  TimelineDot,
  TimelineLine
} from "./styles";
import { Button, Stack, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

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
        {
          (item.imageUrl) ?
            <ProductImage src={item.imageUrl} alt={item.productName} />
            :
            <ImagePlaceholder />
        }
        <Stack spacing={0.5}>
          <Typography variant="body1" fontWeight={700}>{item.productName}</Typography>
          <Typography variant="body2" color="text.secondary">{item.sku}</Typography>
        </Stack>
      </Stack>

      <PriceList>
        <TimelineLine />
        {
          priceRows.map((row, index) => (
            <PriceListItem isSuggested={row.isSuggested}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimelineDot />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {
                    row.isSuggested ?
                      <Stack>
                        <Typography variant="body2" color="text.secondary">Nuevo precio sugerido</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="body1" fontWeight={600}>{formatPrice(row.price)}</Typography>
                          {
                            row.direction === "up" ?
                              <ArrowUp size={14} strokeWidth={2} color={theme.palette.primary.main} />
                              :
                              <ArrowDown size={14} strokeWidth={2} color={theme.palette.primary.main} />
                          }
                          <Typography variant="body2" color="primary.main" fontWeight={600}>{row.changePercent}%</Typography>
                        </Stack>
                      </Stack>
                      :
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" color="text.secondary">{formatPrice(row.price)}</Typography>
                        {
                          row.direction === "up" ?
                            <ArrowUp size={14} strokeWidth={2} color={theme.palette.text.secondary} />
                            :
                            <ArrowDown size={14} strokeWidth={2} color={theme.palette.text.secondary} />
                        }
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{row.changePercent}%</Typography>
                      </Stack>
                  }
                </Stack>
              </Stack>
              {
                row.isSuggested &&
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleApply}>
                  Aplicar
                </Button>
              }
            </PriceListItem>
          ))
        }
      </PriceList>
    </CardContainer>
  );
}
