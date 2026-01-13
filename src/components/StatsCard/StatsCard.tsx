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
  /** Custom border color for the card */
  borderColor?: string;
  /** Custom color for the value */
  valueColor?: string;
  /** Format value as currency */
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
  /** Custom border color for the card */
  borderColor?: string;
  /** Custom color for the value */
  valueColor?: string;
  /** Format value as currency */
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
      return `$${val.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return val.toLocaleString();
  };

  const formatComparisonValue = (val: number): string => {
    if (isCurrency) {
      return `$${val.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return val.toLocaleString();
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
        <CardLabel>{label}</CardLabel>
        <IconWrapper>{icon}</IconWrapper>
      </CardHeader>
      <CardValue valueColor={valueColor}>{formatValue(value)}</CardValue>
      {comparison && (
        <ComparisonText trend={getTrend()}>{getComparisonText()}</ComparisonText>
      )}
    </CardContainer>
  );
}

interface StatsCardGroupProps {
  cards: StatsCardData[];
  /** Number of columns in the grid. Defaults to the number of cards (auto-fit) */
  columns?: number;
}

export function StatsCardGroup({ cards, columns }: StatsCardGroupProps) {
  // Use provided columns or default to number of cards for auto-fit behavior
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
