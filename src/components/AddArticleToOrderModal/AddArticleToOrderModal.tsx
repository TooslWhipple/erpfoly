import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Stack,
  Typography,
  Button,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import numeral from "numeral";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Article, OrderItem } from "@/types/pedidos.types";
import type {
  ProductSupplierPurchaseContext,
  UpdateAgreedPricePayload,
} from "@/types/orders.types";
import { formatDate } from "@/utils/date";
import { SideModal } from "@/components/SideModal";
import { FormDatePicker, FormSelect, FormTextField, MoneyInput } from "@/components/Form";
import { theme } from "@/styles/theme";
import {
  AddArticleModalContainer,
  ProductImage,
  ImagePlaceholder,
  AgreementSection,
  HistorySection,
  TimelineLine,
  TimelineItem,
  TimelineDot,
  TimelineContent,
  UnitPriceSection,
} from "./styles";

export interface CostHistoryEntry {
  id: string;
  date: string;
  price: number;
  changePercentage: number;
  orderId?: string;
}

export interface AddArticleToOrderModalProps {
  open: boolean;
  onClose: () => void;
  article: Article | null;
  onAddToOrder: (item: OrderItem) => void;
  purchaseContext?: ProductSupplierPurchaseContext | null;
  loading?: boolean;
  onSaveAgreedPrice: (payload: UpdateAgreedPricePayload) => Promise<boolean>;
}

const ORDER_CURRENCIES = [
  { value: "MXN", label: "MXN" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

function formatCurrency(amount: number): string {
  return numeral(amount).format("$0,0.00");
}

export function AddArticleToOrderModal({
  open,
  onClose,
  article,
  onAddToOrder,
  purchaseContext = null,
  loading = false,
  onSaveAgreedPrice,
}: AddArticleToOrderModalProps) {
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  const [validUntil, setValidUntil] = useState("");
  const [currency, setCurrency] = useState<string>("MXN");
  const [exchangeRate, setExchangeRate] = useState<number | "">("");
  const [savingAgreedPrice, setSavingAgreedPrice] = useState(false);
  const hydratedArticleId = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !article) {
      hydratedArticleId.current = null;
      return;
    }
    if (loading) return;
    if (hydratedArticleId.current === article.id) return;
    hydratedArticleId.current = article.id;

    const suggested = purchaseContext?.suggestedUnitPrice;
    setUnitPrice(suggested != null && suggested > 0 ? suggested : null);
    setAgreedPrice(
      purchaseContext?.agreedUnitPrice != null &&
        purchaseContext.agreedUnitPrice > 0
        ? purchaseContext.agreedUnitPrice
        : null,
    );
    setValidUntil(purchaseContext?.agreedPriceValidUntil ?? "");
    setCurrency("MXN");
    setExchangeRate("");
  }, [open, article, loading, purchaseContext]);

  const handleClose = () => {
    setUnitPrice(null);
    setAgreedPrice(null);
    setValidUntil("");
    setCurrency("MXN");
    setExchangeRate("");
    setSavingAgreedPrice(false);
    hydratedArticleId.current = null;
    onClose();
  };

  const handleExchangeRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === "" || /^\d*\.?\d{0,6}$/.test(inputValue)) {
      setExchangeRate(inputValue === "" ? "" : parseFloat(inputValue));
    }
  };

  const requiresExchangeRate = currency !== "MXN";
  const isExchangeRateValid =
    !requiresExchangeRate || (typeof exchangeRate === "number" && exchangeRate > 0);
  const canAdd = unitPrice != null && unitPrice > 0 && isExchangeRateValid;
  const canSaveAgreedPrice =
    agreedPrice != null && agreedPrice > 0 && validUntil.trim().length > 0;

  const handleAddToOrder = async () => {
    if (!article || !canAdd || unitPrice == null || savingAgreedPrice) {
      return;
    }

    if (canSaveAgreedPrice && agreedPrice != null) {
      setSavingAgreedPrice(true);
      try {
        const saved = await onSaveAgreedPrice({
          agreedUnitPrice: agreedPrice,
          agreedPriceValidUntil: validUntil,
        });
        if (!saved) return;
      } finally {
        setSavingAgreedPrice(false);
      }
    }

    const newItem: OrderItem = {
      articleId: article.id,
      articleName: article.name,
      folio: article.folio,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      currency,
      exchangeRate: requiresExchangeRate ? (exchangeRate as number) : undefined,
    };

    onAddToOrder(newItem);
    handleClose();
  };

  if (!article) {
    return null;
  }

  const history = purchaseContext?.purchaseHistory ?? [];

  return (
    <SideModal
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      headerActionsPosition="top"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          sx={{ minWidth: "96px" }}
          onClick={handleAddToOrder}
          disabled={!canAdd || savingAgreedPrice}>
          {
            (savingAgreedPrice) ? <CircularProgress size={18} color="inherit" /> : "Agregar"
          }
        </Button>
      }
      headerContent={
        <Stack direction="row" alignItems="center" spacing={1}>
          {article.image ? (
            <ProductImage src={article.image} alt={article.name} />
          ) : (
            <ImagePlaceholder />
          )}
          <Stack direction="column" spacing={0.5}>
            <Typography variant="h5">{article.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {article.folio}
            </Typography>
          </Stack>
        </Stack>
      }>
      <AddArticleModalContainer>
        <AgreementSection>
          <Typography variant="h6">Acuerdo con el proveedor</Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "flex-end" }}>
            <MoneyInput
              label="Precio vigente"
              value={agreedPrice}
              onChange={setAgreedPrice}
              placeholder="0.00"
              sx={{ flex: 1 }}
            />
            <FormDatePicker
              label="Fecha de vigencia"
              value={validUntil}
              onChange={setValidUntil}
              placeholder="Selecciona"
            />
          </Stack>
        </AgreementSection>
        <Divider />

        <Typography variant="h6">Historial de costos de este artículo.</Typography>

        <HistorySection>
          <UnitPriceSection hasHistory={history.length > 0}>
            {
              history.length > 0 && <TimelineDot style={{ top: "36px" }} />
            }
            <MoneyInput
              value={unitPrice}
              onChange={setUnitPrice}
              label="Precio"
              placeholder="0.00"
              fullWidth
            />
            <FormSelect
              label="Moneda"
              value={currency}
              onChange={(e) => setCurrency(String(e.target.value))}
              options={ORDER_CURRENCIES}
            />
            {
              requiresExchangeRate &&
              <FormTextField
                label="Tipo de cambio"
                placeholder="17.20"
                type="text"
                value={exchangeRate}
                onChange={handleExchangeRateChange}
                error={requiresExchangeRate && !isExchangeRateValid}
                helperText={
                  requiresExchangeRate && !isExchangeRateValid
                    ? "Requerido, mayor a 0"
                    : undefined
                }
                inputProps={{ inputMode: "decimal" }}
              />
            }
          </UnitPriceSection>
          {
            history.length > 0 && <TimelineLine />
          }
          {
            (loading) ?
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
              : (history.length === 0) ?
                <Typography variant="body2" color="text.secondary" sx={{ pl: "18px" }}>
                  Este artículo aún no tiene compras previas con este proveedor.
                </Typography>
                :
                history.map((entry) => (
                  <TimelineItem key={entry.id}>
                    <TimelineDot />
                    <TimelineContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ width: "100%" }}>
                        <Stack direction="column" spacing={0.5} sx={{ flex: 1 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(entry.date, "dateLong")}
                            </Typography>
                            <Typography
                              component={Link}
                              href={`/pedidos/${entry.orderId}`}
                              variant="body2"
                              color="primary"
                              sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                              Pedido {entry.orderFolio}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
                            <Typography variant="subtitle1">{formatCurrency(entry.price)}</Typography>
                            <Stack direction="row" alignItems="center" spacing={0.25}>
                              {entry.changePercentage > 0 ? (
                                <ArrowUp size={14} strokeWidth={2} color={theme.palette.text.secondary} />
                              ) : entry.changePercentage < 0 ? (
                                <ArrowDown size={14} strokeWidth={2} color={theme.palette.text.secondary} />
                              ) : null}
                              <Typography variant="body2" color="text.secondary">
                                {numeral(Math.abs(entry.changePercentage)).format("0.00")}%
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    </TimelineContent>
                  </TimelineItem>
                ))
          }
        </HistorySection>
      </AddArticleModalContainer>
    </SideModal>
  );
}
