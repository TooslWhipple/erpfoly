"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { Minus, Plus } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components";
import { PrinterSetupDialog } from "@/components/printing";
import {
  PrinterNotConfiguredError,
  useLabelPrinter,
} from "@/hooks/printing/useLabelPrinter";
import {
  getProductById,
  type ProductDetailPromotionDto,
} from "@/services/productos.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  ActiveBadge,
  DiscountAmount,
  DiscountBadge,
  FinalPriceRow,
  PrintButton,
  ProductCard,
  ProductThumb,
  PromoCard,
  PromosHeader,
  QuantityRow,
  QuantityValue,
  StepperButton,
  StepperControl,
  SummaryRow,
  SummarySection,
} from "./PrintProductLabelsModal.styles";

const MAX_LABEL_QUANTITY = 200;
const NONE_PROMO_ID = "none";

function computePromotionalPrice(
  basePrice: number,
  discountRatePercent: number,
): number {
  const clamped = Math.min(100, Math.max(0, discountRatePercent));
  return basePrice * (1 - clamped / 100);
}

function promotionOriginLabel(promo: ProductDetailPromotionDto): string {
  const supplierIds = promo.payload.supplierIds ?? [];
  if (supplierIds.length > 0) {
    return "Promoción configurada en Proveedor";
  }
  return "Promoción configurada en el artículo";
}

function resolveProductImage(
  images: Array<{ previewUrl?: string | null; imageUrl?: string }> | undefined,
): string | null {
  if (!images?.length) return null;
  for (const img of images) {
    const url = img.previewUrl ?? img.imageUrl;
    if (url?.trim()) return url.trim();
  }
  return null;
}

export interface PrintProductLabelsModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productSku: string;
  /** Shelf/list price from inventory (preferred over product cost). */
  listPrice: number;
  imageUrl?: string | null;
}

export function PrintProductLabelsModal({
  open,
  onClose,
  productId,
  productName,
  productSku,
  listPrice,
  imageUrl: imageUrlProp,
}: PrintProductLabelsModalProps) {
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const {
    isConfigured,
    acknowledgePrinterSetup,
    printerProfile,
    printEtiquetaVenta,
    status: printStatus,
  } = useLabelPrinter();

  const [quantity, setQuantity] = useState(1);
  const [selectedPromoKey, setSelectedPromoKey] = useState<string>(NONE_PROMO_ID);
  const [promotions, setPromotions] = useState<ProductDetailPromotionDto[]>([]);
  const [resolvedImage, setResolvedImage] = useState<string | null>(
    imageUrlProp ?? null,
  );
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [printerSetupOpen, setPrinterSetupOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setQuantity(1);
    setSelectedPromoKey(NONE_PROMO_ID);
    setResolvedImage(imageUrlProp ?? null);
    setLoadingPromos(true);

    let cancelled = false;
    void (async () => {
      try {
        const result = await getProductById(productId);
        if (cancelled) return;
        if (result.error || !result.data) {
          setPromotions([]);
          return;
        }
        setPromotions(result.data.promotions ?? []);
        if (!imageUrlProp) {
          setResolvedImage(resolveProductImage(result.data.images));
        }
      } catch {
        if (!cancelled) setPromotions([]);
      } finally {
        if (!cancelled) setLoadingPromos(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, productId, imageUrlProp]);

  const selectedPromotion = useMemo(() => {
    if (selectedPromoKey === NONE_PROMO_ID) return null;
    const id = Number(selectedPromoKey);
    return promotions.find((p) => p.promotionId === id) ?? null;
  }, [selectedPromoKey, promotions]);

  const discountRate = selectedPromotion?.payload.discountRate ?? 0;
  const finalPrice = selectedPromotion
    ? computePromotionalPrice(listPrice, discountRate)
    : listPrice;
  const discountAmount = Math.max(0, listPrice - finalPrice);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () =>
    setQuantity((q) => Math.min(MAX_LABEL_QUANTITY, q + 1));

  const runPrint = useCallback(async () => {
    setPrinting(true);
    try {
      await printEtiquetaVenta({
        productId,
        quantity,
        promotionId: selectedPromotion?.promotionId ?? null,
      });
      showSuccess(
        quantity === 1
          ? "Etiqueta enviada a impresión"
          : `${quantity} etiquetas enviadas a impresión`,
      );
      onClose();
    } catch (err) {
      if (err instanceof PrinterNotConfiguredError) {
        setPrinterSetupOpen(true);
        return;
      }
      showError(
        err instanceof Error
          ? err.message
          : "No se pudieron imprimir las etiquetas",
      );
    } finally {
      setPrinting(false);
    }
  }, [
    printEtiquetaVenta,
    productId,
    quantity,
    selectedPromotion,
    showSuccess,
    showError,
    onClose,
  ]);

  const handlePrintClick = () => {
    if (!isConfigured) {
      setPrinterSetupOpen(true);
      return;
    }
    void runPrint();
  };

  const handlePrinterSetupConfirm = () => {
    acknowledgePrinterSetup();
    setPrinterSetupOpen(false);
    void runPrint();
  };

  const handleClose = () => {
    if (printing || printStatus === "fetching" || printStatus === "printing") {
      return;
    }
    onClose();
  };

  const isBusy =
    printing || printStatus === "fetching" || printStatus === "printing";

  return (
    <>
      <SideModal
        open={open}
        onClose={handleClose}
        title="Imprimir etiquetas"
        description="Configura cantidad de etiquetas a imprimir."
        maxWidth="md"
        disableClose={isBusy}
        headerActionsPosition="top"
        headerActions={
          <PrintButton
            variant="contained"
            color="primary"
            onClick={handlePrintClick}
            disabled={isBusy || listPrice < 0}
            startIcon={
              isBusy ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Imprimir etiquetas
          </PrintButton>
        }
        contentSx={{ gap: 3 }}
      >
        <ProductCard>
          <ProductThumb>
            {resolvedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolvedImage} alt={productName} />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sin imagen
              </Typography>
            )}
          </ProductThumb>
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SKU: {productSku}
            </Typography>
          </Stack>
        </ProductCard>

        <QuantityRow>
          <Stack spacing={0.25}>
            <Typography variant="subtitle2" fontWeight={600}>
              Cantidad de etiquetas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Copias listas para impresión
            </Typography>
          </Stack>
          <StepperControl>
            <StepperButton
              aria-label="Disminuir cantidad"
              onClick={decrement}
              disabled={quantity <= 1 || isBusy}
            >
              <Minus size={16} />
            </StepperButton>
            <QuantityValue>{quantity}</QuantityValue>
            <StepperButton
              aria-label="Aumentar cantidad"
              onClick={increment}
              disabled={quantity >= MAX_LABEL_QUANTITY || isBusy}
            >
              <Plus size={16} />
            </StepperButton>
          </StepperControl>
        </QuantityRow>

        {!loadingPromos && promotions.length > 0 && (
          <Stack spacing={1.5}>
            <PromosHeader>
              <Typography variant="subtitle2" fontWeight={600}>
                Promociones aplicadas
              </Typography>
              <ActiveBadge
                size="small"
                label={`${promotions.length} Activa${promotions.length === 1 ? "" : "s"}`}
              />
            </PromosHeader>

            <Stack spacing={1}>
              <PromoCard
                selected={selectedPromoKey === NONE_PROMO_ID}
                onClick={() => setSelectedPromoKey(NONE_PROMO_ID)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPromoKey(NONE_PROMO_ID);
                  }
                }}
              >
                <Stack spacing={0.5} minWidth={0}>
                  <Typography variant="body1" fontWeight={600}>
                    Sin promoción
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Precio de lista sin descuento
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" fontWeight={700}>
                  {numeral(listPrice).format("$0,0.00")}
                </Typography>
              </PromoCard>

              {promotions.map((promo) => {
                const key = String(promo.promotionId);
                const price = computePromotionalPrice(
                  listPrice,
                  promo.payload.discountRate,
                );
                const selected = selectedPromoKey === key;
                return (
                  <PromoCard
                    key={key}
                    selected={selected}
                    onClick={() => setSelectedPromoKey(key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPromoKey(key);
                      }
                    }}
                  >
                    <Stack spacing={0.5} minWidth={0}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Typography variant="body1" fontWeight={600}>
                          {promo.payload.name}
                        </Typography>
                        <DiscountBadge
                          size="small"
                          label={`${numeral(promo.payload.discountRate).format("0,0.[00]")}%`}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {promotionOriginLabel(promo)}
                        </Typography>
                        {(promo.payload.supplierIds?.length ?? 0) > 0 && (
                          <OpenInNewIcon
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                        )}
                      </Stack>
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {numeral(price).format("$0,0.00")}
                    </Typography>
                  </PromoCard>
                );
              })}
            </Stack>
          </Stack>
        )}

        <SummarySection>
          <SummaryRow>
            <Typography variant="body2" color="text.secondary">
              Precio original
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {numeral(listPrice).format("$0,0.00")}
            </Typography>
          </SummaryRow>
          {discountRate > 0 && (
            <SummaryRow>
              <Typography variant="body2" color="text.secondary">
                {`Descuento aplicado (${numeral(discountRate).format("0,0.[00]")}%)`}
              </Typography>
              <DiscountAmount variant="body2">
                -{numeral(discountAmount).format("$0,0.00")}
              </DiscountAmount>
            </SummaryRow>
          )}
          <FinalPriceRow>
            <Stack spacing={0.25}>
              <Typography variant="subtitle1" fontWeight={700}>
                Precio final por etiqueta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {discountRate > 0
                  ? "Neto con promociones aplicadas"
                  : "Precio de lista"}
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700}>
              {numeral(finalPrice).format("$0,0.00")}
            </Typography>
          </FinalPriceRow>
        </SummarySection>
      </SideModal>

      <PrinterSetupDialog
        open={printerSetupOpen}
        onClose={() => setPrinterSetupOpen(false)}
        onConfirm={handlePrinterSetupConfirm}
        printerProfile={printerProfile}
      />
    </>
  );
}
