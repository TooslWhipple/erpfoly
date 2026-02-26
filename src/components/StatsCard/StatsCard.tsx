import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import numeral from "numeral";
import {
  CardContainer,
  CardHeader,
  IconWrapper,
  StatsCardGroupContainer,
} from "./styles";
import { Typography } from "@mui/material";

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
  borderColor?: string;
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
  borderColor?: string;
  valueColor?: string;
  isCurrency?: boolean;
}

export function StatsCard({
  label,
  value,
  comparison,
  icon = <CalendarIcon />,
  borderColor,
  valueColor,
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

  const getTrend = (): "positive" | "negative" | "neutral" => {
    if (!comparison) return "neutral";
    // In delinquency context, decrease is positive (fewer delinquent customers)
    return comparison.type === "decrease" ? "neutral" : "neutral";
  };

  return (
    <CardContainer borderColor={borderColor}>
      <CardHeader>
        <Typography variant="subtitle1">{label}</Typography>
        <IconWrapper>{icon}</IconWrapper>
      </CardHeader>
      <Typography variant="h2" fontWeight={700}>{formatValue(value)}</Typography>
      {comparison && (
        <Typography variant="body2" color="text.secondary">{getComparisonText()}</Typography>
      )}
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
    <StatsCardGroupContainer columns={gridColumns}>
      {cards.map((card) => (
        <StatsCard
          key={card.id}
          label={card.label}
          value={card.value}
          comparison={card.comparison}
          icon={card.icon}
          borderColor={card.borderColor}
          valueColor={card.valueColor}
          isCurrency={card.isCurrency}
        />
      ))}
    </StatsCardGroupContainer>
  );
}
