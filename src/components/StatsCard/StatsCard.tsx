import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import {
  CardContainer,
  CardHeader,
  CardLabel,
  CardValue,
  ComparisonText,
  IconWrapper,
  StatsCardGroupContainer,
} from "./styles";

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
}

export function StatsCard({
  label,
  value,
  comparison,
  icon = <CalendarIcon />,
}: StatsCardProps) {
  const formatValue = (val: number): string => {
    return val.toLocaleString();
  };

  const getComparisonText = (): string => {
    if (!comparison) return "";
    const prefix = comparison.type === "increase" ? "más" : "menos";
    return `${comparison.value} ${prefix} que ${comparison.period}`;
  };

  const getTrend = (): "positive" | "negative" | "neutral" => {
    if (!comparison) return "neutral";
    // In delinquency context, decrease is positive (fewer delinquent customers)
    return comparison.type === "decrease" ? "neutral" : "neutral";
  };

  return (
    <CardContainer>
      <CardHeader>
        <CardLabel>{label}</CardLabel>
        <IconWrapper>{icon}</IconWrapper>
      </CardHeader>
      <CardValue>{formatValue(value)}</CardValue>
      {comparison && (
        <ComparisonText trend={getTrend()}>{getComparisonText()}</ComparisonText>
      )}
    </CardContainer>
  );
}

interface StatsCardGroupProps {
  cards: StatsCardData[];
}

export function StatsCardGroup({ cards }: StatsCardGroupProps) {
  return (
    <StatsCardGroupContainer>
      {cards.map((card) => (
        <StatsCard
          key={card.id}
          label={card.label}
          value={card.value}
          comparison={card.comparison}
          icon={card.icon}
        />
      ))}
    </StatsCardGroupContainer>
  );
}
