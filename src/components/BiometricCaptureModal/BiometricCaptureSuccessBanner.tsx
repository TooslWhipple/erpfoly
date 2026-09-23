"use client";

import { Button } from "@mui/material";
import { Check, RefreshCw } from "lucide-react";
import {
  SuccessBanner,
  SuccessBannerText,
  SuccessIcon,
  SuccessSubtitle,
  SuccessTitle,
} from "./styles";

interface BiometricCaptureSuccessBannerProps {
  title: string;
  subtitle?: string;
  retryLabel?: string;
  onRetry: () => void;
}

export function BiometricCaptureSuccessBanner({
  title,
  subtitle,
  retryLabel = "Repetir",
  onRetry,
}: BiometricCaptureSuccessBannerProps) {
  return (
    <SuccessBanner>
      <SuccessBannerText>
        <SuccessIcon>
          <Check size={16} strokeWidth={2.75} />
        </SuccessIcon>
        <div>
          <SuccessTitle>{title}</SuccessTitle>
          {subtitle ? <SuccessSubtitle>{subtitle}</SuccessSubtitle> : null}
        </div>
      </SuccessBannerText>
      <Button
        variant="outlined"
        color="inherit"
        onClick={onRetry}
        startIcon={<RefreshCw size={16} />}
        sx={{
          flexShrink: 0,
          alignSelf: { xs: "flex-end", sm: "center" },
          color: "text.primary",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {retryLabel}
      </Button>
    </SuccessBanner>
  );
}
