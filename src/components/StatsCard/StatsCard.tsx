import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import numeral from "numeral";
import {
  CardContainer
} from "./styles";
import { Grid, Stack, Typography } from "@mui/material";
import { ArrowDown, ArrowUp } from "lucide-react";

export interface StatsCardData {
  id: string;
  label: string;
  value: number;
  comparison?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon?: React.ReactNode;
  valueColor?: string;
  isCurrency?: boolean;
}

interface StatsCardProps {
  label: string;
  value: number;
  comparison?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon?: React.ReactNode;
  isCurrency?: boolean;
}

export function StatsCard({
  label,
  value,
  comparison,
  icon = <CalendarIcon />,
  isCurrency = false,
}: StatsCardProps) {
  const formatValue = (val: number): string => {
    if (isCurrency) {
      return numeral(val).format("$0,0.00");
    }
    return numeral(val).format("0,0");
  };

  const formatComparisonValue = (val: number): string => {
    if (isCurrency) {
      return numeral(val).format("$0,0.00");
    }
    return numeral(val).format("0,0");
  };

  const getComparisonText = (): string => {
    if (!comparison) return "";
    const prefix = comparison.type === "increase" ? "más" : "menos";
    return `${formatComparisonValue(comparison.value)} ${prefix} que ${comparison.period}`;
  };

  return (
    <CardContainer>
      <Typography variant="subtitle1">{label}</Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="h2" fontWeight={700}>{formatValue(value)}</Typography>
        {
          comparison?.type === "increase" ? <ArrowUp size={16} color='#DC2626' /> : <ArrowDown size={16} color="#4ADE80" />
        }
      </Stack>
      {
        comparison && <Typography variant="body2" color="text.secondary">{getComparisonText()}</Typography>
      }
    </CardContainer>
  );
}

interface StatsCardGroupProps {
  cards: StatsCardData[];
  columns?: number;
}

export function StatsCardGroup({ cards, columns }: StatsCardGroupProps) {
  const gridColumns = columns ?? cards.length;

  return (
    <Grid container spacing={2}>
      {
        cards.map((card) => (
          <Grid key={card.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatsCard
              label={card.label}
              value={card.value}
              comparison={card.comparison}
              icon={card.icon}
              isCurrency={card.isCurrency}
            />
          </Grid>
        ))
      }
    </Grid>
  );
}
