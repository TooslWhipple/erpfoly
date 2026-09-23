"use client";

import { Check } from "lucide-react";
import {
  StepBadge,
  StepItem,
  StepLabel,
  StepperRoot,
  StepsRow,
  TrackRow,
  TrackSegment,
} from "./styles";

export interface BiometricStep {
  id: string;
  label: string;
}

interface BiometricStepperProps {
  steps: BiometricStep[];
  activeStepIndex: number;
}

export function BiometricStepper({ steps, activeStepIndex }: BiometricStepperProps) {
  return (
    <StepperRoot>
      <TrackRow>
        {steps.map((step, index) => (
          <TrackSegment key={step.id} filled={index <= activeStepIndex} />
        ))}
      </TrackRow>
      <StepsRow>
        {steps.map((step, index) => {
          const status =
            index < activeStepIndex ? "complete" : index === activeStepIndex ? "active" : "upcoming";
          return (
            <StepItem key={step.id}>
              <StepBadge status={status}>
                {status === "complete" ? <Check size={16} strokeWidth={2.5} /> : index + 1}
              </StepBadge>
              <StepLabel status={status}>{step.label}</StepLabel>
            </StepItem>
          );
        })}
      </StepsRow>
    </StepperRoot>
  );
}
