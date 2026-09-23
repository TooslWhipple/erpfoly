"use client";

import { Button, CircularProgress, Typography } from "@mui/material";
import { FooterActions, FooterRoot } from "./styles";

interface BiometricCaptureFooterProps {
  error?: string | null;
  showBack?: boolean;
  onBack?: () => void;
  backDisabled?: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
}

export function BiometricCaptureFooter({
  error,
  showBack = false,
  onBack,
  backDisabled = false,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
}: BiometricCaptureFooterProps) {
  return (
    <FooterRoot>
      {error ? (
        <Typography variant="body2" color="error.main">
          {error}
        </Typography>
      ) : null}
      <FooterActions>
        {showBack ? (
          <Button variant="outlined" onClick={onBack} disabled={backDisabled || primaryLoading}>
            Atrás
          </Button>
        ) : null}
        <Button
          variant="contained"
          onClick={onPrimary}
          disabled={primaryDisabled || primaryLoading}
          sx={{ marginLeft: "auto", minWidth: 140 }}
        >
          {primaryLoading ? <CircularProgress size={18} color="inherit" /> : primaryLabel}
        </Button>
      </FooterActions>
    </FooterRoot>
  );
}
