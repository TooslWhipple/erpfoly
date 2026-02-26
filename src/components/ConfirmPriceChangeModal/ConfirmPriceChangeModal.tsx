import { Dialog, Button, CircularProgress } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { ChevronDown, ChevronUp } from "lucide-react";
import numeral from "numeral";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
  ProductCard,
  ProductRow,
  ProductImage,
  ProductInfo,
  ProductName,
  ProductSku,
  PriceComparisonRow,
  PriceBlock,
  PriceLabel,
  PriceValue,
  NewPriceWithChange,
  ChangeIndicator,
} from "./styles";
import { FormActions, ConfirmButton } from "@/components/Form/styles";

// ============================================================================
// TYPES
// ============================================================================

export interface ConfirmPriceChangeModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  sku: string;
  /** Previous price before change */
  previousPrice: number;
  /** New suggested price */
  newPrice: number;
  /** Percentage change (e.g. 12 for 12%) */
  changePercent: number;
  direction: "up" | "down";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPrice(value: number): string {
  return numeral(value).format("$0,0.00");
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConfirmPriceChangeModal({
  open,
  onClose,
  productName,
  sku,
  previousPrice,
  newPrice,
  changePercent,
  direction,
  onConfirm,
  loading = false,
}: ConfirmPriceChangeModalProps) {
  const handleClose = (_event: object, reason: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      if (!loading) onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <StyledDialogContent>
        <ModalHeader>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <ModalTitle>Confirmar cambio de precio</ModalTitle>
            <ModalDescription>
              ¿Estás seguro que deseas confirmar este cambio de precio?
            </ModalDescription>
          </div>
          <CloseButton onClick={onClose} disabled={loading} size="small">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <ProductCard>
          <ProductRow>
            <ProductImage />
            <ProductInfo>
              <ProductName>{productName}</ProductName>
              <ProductSku>{sku}</ProductSku>
            </ProductInfo>
          </ProductRow>

          <PriceComparisonRow>
            <PriceBlock>
              <PriceLabel>Precio anterior</PriceLabel>
              <PriceValue>{formatPrice(previousPrice)}</PriceValue>
            </PriceBlock>
            <PriceBlock>
              <PriceLabel>Nuevo precio sugerido</PriceLabel>
              <NewPriceWithChange>
                <PriceValue>{formatPrice(newPrice)}</PriceValue>
                <ChangeIndicator direction={direction}>
                  {direction === "down" ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronUp size={18} />
                  )}
                  <span>{changePercent}%</span>
                </ChangeIndicator>
              </NewPriceWithChange>
            </PriceBlock>
          </PriceComparisonRow>
        </ProductCard>

        <FormActions>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onClose}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <ConfirmButton
            type="button"
            variant="contained"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirmar"
            )}
          </ConfirmButton>
        </FormActions>
      </StyledDialogContent>
    </Dialog>
  );
}
