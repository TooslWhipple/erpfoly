"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, useMediaQuery, useTheme } from "@mui/material";
import { X as CloseIcon } from "lucide-react";
import { CloseButton } from "@/components/ModalForm/styles";
import { BiometricStepper, type BiometricStep } from "./BiometricStepper";
import { Eyebrow, HeaderBlock, HeaderSide, HeaderText, ShellBody, StepSubtitle, StepTitle } from "./styles";

export interface BiometricCaptureModalShellProps {
  open: boolean;
  onClose: () => void;
  disableClose?: boolean;
  clientDisplayName?: string;
  title: string;
  subtitle?: string;
  steps: BiometricStep[];
  activeStepIndex: number;
  headerActions?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

function formatEyebrow(clientDisplayName?: string): string {
  const name = clientDisplayName?.trim();
  if (!name) return "Alta de biométricos";
  return `Alta de biométricos · ${name.toLocaleUpperCase("es-MX")}`;
}

export function BiometricCaptureModalShell({
  open,
  onClose,
  disableClose = false,
  clientDisplayName,
  title,
  subtitle,
  steps,
  activeStepIndex,
  headerActions,
  children,
  footer,
}: BiometricCaptureModalShellProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const fullScreen = compact || coarsePointer;

  const handleClose = (_event: object, reason: string) => {
    if (reason === "backdropClick") return;
    if (disableClose) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: fullScreen
          ? {
              margin: 0,
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
            }
          : {
              width: "min(760px, calc(100vw - 48px))",
              maxWidth: "calc(100vw - 48px)",
              height: "min(840px, calc(100dvh - 48px))",
              maxHeight: "calc(100dvh - 48px)",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
            },
      }}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: fullScreen ? 2 : 3,
        }}
      >
        <HeaderBlock>
          <HeaderText>
            <Eyebrow>{formatEyebrow(clientDisplayName)}</Eyebrow>
            <StepTitle>{title}</StepTitle>
            {subtitle ? <StepSubtitle>{subtitle}</StepSubtitle> : null}
          </HeaderText>
          <HeaderSide>
            {headerActions}
            <CloseButton aria-label="Cerrar" onClick={onClose} disabled={disableClose} size="small">
              <CloseIcon size={16} />
            </CloseButton>
          </HeaderSide>
        </HeaderBlock>

        <BiometricStepper steps={steps} activeStepIndex={activeStepIndex} />

        <ShellBody>{children}</ShellBody>
        {footer}
      </DialogContent>
    </Dialog>
  );
}
