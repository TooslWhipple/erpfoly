import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import numeral from "numeral";
import {
  CardContainer
} from "./styles";
import { Grid, Skeleton, Stack, Typography } from "@mui/material";
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
  loading?: boolean;
}

export function StatsCardGroup({ cards, columns = 3, loading = false }: StatsCardGroupProps) {
  const size = 12 / columns;

  if (loading) {
    return (
      <Grid container spacing={2} alignItems="stretch">
        {
          [1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: size }}>
              <Skeleton variant="rectangular" width="100%" height="96px" style={{ borderRadius: "16px" }} animation="wave" />
            </Grid>
          ))
        }
      </Grid>
    )
  }

  return (
    <Grid container spacing={2} alignItems="stretch">
      {
        cards.map((card) => (
          <Grid key={card.id} size={{ xs: 12, sm: 6, md: size }}>
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
