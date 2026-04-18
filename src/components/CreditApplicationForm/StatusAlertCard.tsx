import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import {
  StatusAlertContainer,
  type StatusAlertCardVariant,
} from "./StatusAlertCard.styles";

interface StatusAlertCardProps {
  title: string;
  message: string;
  icon?: ReactNode;
  variant?: StatusAlertCardVariant;
}

export function StatusAlertCard({
  title,
  message,
  icon,
  variant = "default",
}: StatusAlertCardProps) {
  return (
    <StatusAlertContainer variant={variant}>
      {icon}
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" color="inherit">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </Stack>
    </StatusAlertContainer>
  );
}
