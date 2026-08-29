import {
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { InlineMobileMenuButton } from "@/components/Layout";
import { HeaderActions, PageHeader, TouchButton } from "./styles";

export interface SaleBuilderHeaderProps {
  title: string;
  onExit: () => void;
  isCajeroMode: boolean;
  canProceed: boolean;
  showDiscountButton: boolean;
  discountDisabled: boolean;
  operationPending: boolean;
  savePending: boolean;
  saveDisabled: boolean;
  registerPending: boolean;
  saveLabel: string;
  onSave: () => void;
  onDiscount: () => void;
  onRegisterSale: () => void;
  onProceedToCheckout: () => void;
  proceedLabel?: string;
  creditLineExceeded?: boolean;
}

export function SaleBuilderHeader({
  title,
  onExit,
  isCajeroMode,
  canProceed,
  showDiscountButton,
  discountDisabled,
  operationPending,
  savePending,
  saveDisabled,
  registerPending,
  saveLabel,
  onSave,
  onDiscount,
  onRegisterSale,
  onProceedToCheckout,
  proceedLabel = "Proceder al cobro",
  creditLineExceeded = false,
}: SaleBuilderHeaderProps) {
  return (
    <PageHeader>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        minWidth={0}
        flex="1 1 auto"
        overflow="hidden"
      >
        <InlineMobileMenuButton />
        <IconButton
          size="small"
          disabled={operationPending}
          onClick={onExit}
          aria-label="Cerrar"
        >
          <X size={18} />
        </IconButton>
        <Typography
          variant="h6"
          fontWeight={700}
          noWrap
          sx={{ minWidth: 0, flex: "1 1 auto" }}
        >
          {title}
        </Typography>
      </Stack>
      <HeaderActions>
        {!isCajeroMode && (
          <>
            <TouchButton
              variant="outlined"
              disabled={saveDisabled || operationPending}
              onClick={onSave}
            >
              {savePending ? <CircularProgress size={16} /> : saveLabel}
            </TouchButton>
            {showDiscountButton && (
              <TouchButton
                variant="outlined"
                disabled={discountDisabled || operationPending}
                onClick={onDiscount}
              >
                Solicitar descuento
              </TouchButton>
            )}
          </>
        )}
        {!isCajeroMode ? (
          <Tooltip title="Quedará pendiente de cobro en caja">
            <span>
              <TouchButton
                variant="contained"
                disabled={!canProceed || operationPending || creditLineExceeded}
                onClick={onRegisterSale}
              >
                {registerPending ? (
                  <CircularProgress size={16} />
                ) : (
                  "Registrar venta (pendiente de cobro)"
                )}
              </TouchButton>
            </span>
          </Tooltip>
        ) : (
          <TouchButton
            variant="contained"
            disabled={!canProceed || operationPending}
            onClick={onProceedToCheckout}
          >
            {proceedLabel}
          </TouchButton>
        )}
      </HeaderActions>
    </PageHeader>
  );
}
