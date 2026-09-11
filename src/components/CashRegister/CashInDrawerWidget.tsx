import { Box, Fade, Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { AlertTriangle, Banknote } from "lucide-react";
import numeral from "numeral";
import { usePermissions } from "@/hooks/usePermissions";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { CASH_REGISTERS_READ } from "@/lib/permissions";
import {
  getCashLimitLevel,
  getCashLimitLevelLabel,
} from "@/utils/cashLimit";
import { CashInDrawerMeter } from "./CashInDrawerMeter";
import {
  CashInDrawerWidgetButton,
  CashInDrawerWidgetSkeletonFrame,
} from "./styles";

interface CashInDrawerWidgetProps {
  collapsed?: boolean;
  onNavigate: (path: string) => void;
}

function CashInDrawerWidgetSkeleton({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <CashInDrawerWidgetSkeletonFrame
        collapsed
        role="status"
        aria-busy="true"
        aria-label="Cargando efectivo en caja"
      >
        <Skeleton
          animation="wave"
          variant="rounded"
          width={16}
          height={16}
          sx={{ borderRadius: 0.75 }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={24}
          height={6}
          sx={{ borderRadius: 4 }}
        />
      </CashInDrawerWidgetSkeletonFrame>
    );
  }

  return (
    <CashInDrawerWidgetSkeletonFrame
      role="status"
      aria-busy="true"
      aria-label="Cargando efectivo en caja"
    >
      <Skeleton
        animation="wave"
        variant="rounded"
        width="52%"
        height={14}
        sx={{ borderRadius: 0.5 }}
      />
      <Skeleton
        animation="wave"
        variant="rounded"
        height={6}
        sx={{ width: "100%", borderRadius: 4 }}
      />
      <Stack direction="row" justifyContent="space-between" spacing={0.5} width="100%">
        <Skeleton
          animation="wave"
          variant="rounded"
          width={72}
          height={12}
          sx={{ borderRadius: 0.5 }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={72}
          height={12}
          sx={{ borderRadius: 0.5 }}
        />
      </Stack>
    </CashInDrawerWidgetSkeletonFrame>
  );
}

export function CashInDrawerWidget({
  collapsed = false,
  onNavigate,
}: CashInDrawerWidgetProps) {
  const theme = useTheme();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission(CASH_REGISTERS_READ);
  const { cashRegister, isLoading } = useCashRegisterSession({ enabled: canRead });

  if (!canRead) {
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ minWidth: 0, width: "100%" }}>
        <CashInDrawerWidgetSkeleton collapsed={collapsed} />
      </Box>
    );
  }

  if (cashRegister == null) {
    return null;
  }

  const isOpen = cashRegister.status === "open";
  const level = getCashLimitLevel(cashRegister.currentCash, cashRegister.limit);
  const formattedCash = numeral(cashRegister.currentCash).format("$0,0.00");
  const formattedLimit = numeral(cashRegister.limit).format("$0,0.00");
  const ariaLabel = isOpen
    ? `Efectivo en caja: ${formattedCash} de ${formattedLimit}, ${getCashLimitLevelLabel(level)}`
    : `Caja cerrada: ${cashRegister.name}`;
  const tooltipTitle = isOpen
    ? `${formattedCash} / ${formattedLimit}`
    : `Caja cerrada: ${cashRegister.name}`;

  const content = collapsed ? (
    <>
      {isOpen && level === "exceeded" ? (
        <AlertTriangle size={16} color={theme.palette.error.main} />
      ) : (
        <Banknote
          size={16}
          color={isOpen ? theme.palette.text.primary : theme.palette.text.secondary}
        />
      )}
      {isOpen && (
        <Box sx={{ width: 24 }}>
          <CashInDrawerMeter
            currentCash={cashRegister.currentCash}
            limit={cashRegister.limit}
            compact
            hideAmounts
          />
        </Box>
      )}
    </>
  ) : (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={0.5}
        minWidth={0}
      >
        <Typography variant="caption" fontWeight={600} noWrap>
          {isOpen ? "Efectivo en caja" : "Caja cerrada"}
        </Typography>
        {isOpen && level === "exceeded" && (
          <AlertTriangle size={14} color={theme.palette.error.main} />
        )}
      </Stack>
      {isOpen ? (
        <CashInDrawerMeter
          currentCash={cashRegister.currentCash}
          limit={cashRegister.limit}
          compact
        />
      ) : (
        <Typography variant="caption" color="text.secondary" noWrap>
          {cashRegister.name}
        </Typography>
      )}
    </>
  );

  const button = (
    <CashInDrawerWidgetButton
      type="button"
      collapsed={collapsed}
      onClick={() => onNavigate("/cajas")}
      aria-label={ariaLabel}
    >
      {content}
    </CashInDrawerWidgetButton>
  );

  return (
    <Fade in timeout={280}>
      <Box sx={{ minWidth: 0, width: "100%" }}>
        {collapsed ? (
          <Tooltip title={tooltipTitle} placement="right" arrow>
            <Box>{button}</Box>
          </Tooltip>
        ) : (
          button
        )}
      </Box>
    </Fade>
  );
}
