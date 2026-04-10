import { useCallback, useMemo, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import { colors } from "@/styles/theme";
import {
  Root,
  TrackShell,
  TrackRail,
  TrackFill,
  ThumbKnob,
  NativeRange,
  EdgeLabelsRow,
  EdgeLabelStart,
  EdgeLabelEnd,
  EdgeLabelMiddle,
  MarkLabelsRow,
  MarkLabelSlot,
} from "./styles";

function nearestMarkIndex(value: number, marks: readonly number[]): number {
  let bestIndex = 0;
  let bestDistance = Infinity;
  marks.forEach((mark, index) => {
    const distance = Math.abs(mark - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

export interface TrackSliderMiddleLabel {
  value: number;
  content: ReactNode;
}

export interface TrackSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Discrete values; when set, the thumb snaps to these positions only. */
  marks?: readonly number[];
  onChange: (event: Event, value: number) => void;
  disabled?: boolean;
  /** Filled portion color (empty track uses theme border tone). */
  filledTrackColor?: string;
  /** Label aligned to the left edge of the control (same width as track). */
  startLabel?: ReactNode;
  /** Label aligned to the right edge of the control. */
  endLabel?: ReactNode;
  /** Optional label positioned along the track by `value` (continuous mode). */
  middleLabel?: TrackSliderMiddleLabel;
  /** Renders labels below the track for each entry in `marks`. */
  getMarkLabel?: (markValue: number, index: number) => ReactNode;
  className?: string;
}

export function TrackSlider({
  value,
  min,
  max,
  step = 1,
  marks,
  onChange,
  disabled = false,
  filledTrackColor = colors.sidebar.textSelected,
  startLabel,
  endLabel,
  middleLabel,
  getMarkLabel,
  className,
}: TrackSliderProps) {
  const isDiscrete = Boolean(marks?.length);

  const discreteIndex = useMemo(() => {
    if (!marks?.length) return 0;
    const directIndex = marks.indexOf(value);
    if (directIndex >= 0) return directIndex;
    return nearestMarkIndex(value, marks);
  }, [marks, value]);

  const fillAndThumbPercent = useMemo(() => {
    if (!marks?.length) {
      if (max <= min) return 0;
      const clamped = Math.min(Math.max(value, min), max);
      return ((clamped - min) / (max - min)) * 100;
    }
    if (marks.length === 1) return 0;
    return (discreteIndex / (marks.length - 1)) * 100;
  }, [marks, value, min, max, discreteIndex]);

  const middleLeftPercent = useMemo(() => {
    if (!middleLabel || isDiscrete) return 0;
    if (max <= min) return 50;
    const clamped = Math.min(Math.max(middleLabel.value, min), max);
    return ((clamped - min) / (max - min)) * 100;
  }, [middleLabel, min, max, isDiscrete]);

  const handleRangeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (marks?.length) {
        const index = Number.parseInt(event.target.value, 10);
        const next = marks[index];
        if (next !== undefined) {
          onChange(event.nativeEvent, next);
        }
        return;
      }
      const next = Number(event.target.value);
      onChange(event.nativeEvent, next);
    },
    [marks, onChange]
  );

  const showEdgeRow =
    startLabel != null || endLabel != null || (middleLabel != null && !isDiscrete);
  const showMarkRow = Boolean(marks?.length && getMarkLabel);

  const rangeMin = isDiscrete ? 0 : min;
  const rangeMax = isDiscrete ? Math.max(marks!.length - 1, 0) : max;
  const rangeStep = isDiscrete ? 1 : step;
  const rangeValue = isDiscrete ? discreteIndex : value;

  const trackShellStyle = {
    "--track-fill-pct": `${fillAndThumbPercent}%`,
    "--thumb-left-pct": `${fillAndThumbPercent}%`,
  } as CSSProperties;

  const edgeMiddleStyle =
    middleLabel && !isDiscrete
      ? ({
          "--middle-left-pct": `${middleLeftPercent}%`,
        } as CSSProperties)
      : undefined;

  return (
    <Root className={className} isDisabled={disabled}>
      <TrackShell style={trackShellStyle}>
        <TrackRail>
          <TrackFill fillColor={filledTrackColor} />
        </TrackRail>
        <ThumbKnob />
        <NativeRange
          type="range"
          min={rangeMin}
          max={rangeMax}
          step={rangeStep}
          value={rangeValue}
          disabled={disabled}
          onChange={handleRangeChange}
          aria-valuemin={isDiscrete ? marks![0] : min}
          aria-valuemax={isDiscrete ? marks![marks!.length - 1] : max}
          aria-valuenow={value}
        />
      </TrackShell>

      {showEdgeRow && (
        <EdgeLabelsRow style={edgeMiddleStyle}>
          <EdgeLabelStart>{startLabel}</EdgeLabelStart>
          {middleLabel != null && !isDiscrete && (
            <EdgeLabelMiddle>{middleLabel.content}</EdgeLabelMiddle>
          )}
          <EdgeLabelEnd>{endLabel}</EdgeLabelEnd>
        </EdgeLabelsRow>
      )}

      {showMarkRow && marks && (
        <MarkLabelsRow>
          {marks.map((markValue, index) => {
            const alignMode: "start" | "center" | "end" =
              marks.length === 1
                ? "center"
                : index === 0
                  ? "start"
                  : index === marks.length - 1
                    ? "end"
                    : "center";
            const positionPct =
              marks.length <= 1 ? 50 : (index / (marks.length - 1)) * 100;
            return (
              <MarkLabelSlot
                key={`${markValue}-${index}`}
                alignMode={alignMode}
                positionPct={positionPct}
              >
                {getMarkLabel!(markValue, index)}
              </MarkLabelSlot>
            );
          })}
        </MarkLabelsRow>
      )}
    </Root>
  );
}
