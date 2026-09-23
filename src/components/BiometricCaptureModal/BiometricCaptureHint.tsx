"use client";

import type { ReactNode } from "react";
import { Typography } from "@mui/material";
import { Info } from "lucide-react";
import { HintRow } from "./styles";

interface BiometricCaptureHintProps {
  children: ReactNode;
}

export function BiometricCaptureHint({ children }: BiometricCaptureHintProps) {
  return (
    <HintRow>
      <Info size={16} style={{ marginTop: 2, flexShrink: 0 }} />
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </HintRow>
  );
}
