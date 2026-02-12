import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { InfoOutlined as InfoOutlinedIcon, Map as MapIcon } from "@mui/icons-material";
import numeral from "numeral";
import { MainLayout, Breadcrumbs, DiscountRequestItemCard } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type {
  ClientSummary,
  DiscountRequestLineItem,
  SaleTypeForm,
} from "@/types/discount-requests.types";
import {
  PageContainer,
  MainContent,
  SidePanel,
  HeaderSection,
  TitleSection,
  PageTitle,
  ActionsSection,
  ActionButton,
  DiscountCard,
  DiscountCardFooter,
  PendingBadge,
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionHeader,
  ChangeLink,
  ClientName,
  ClientDetail,
  ClientNotice,
  ActiveChip,
  ItemsList,
  SummaryRow,
  SummaryLabel,
  SummaryValue,
  TotalRow,
  TotalLabel,
  TotalValue,
  EngancheRow,
  MapPlaceholder,
  DeliveryFieldBlock,
  DeliveryFieldLabel,
  DeliveryFieldRow,
  DeliveryFieldValue,
  DeliveryFieldText,
  DeliveryFieldSecondary,
} from "@/styles/solicitudes-descuento/nuevo.styles";
import { colors } from "@/styles/theme";

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CLIENT: ClientSummary = {
  id: "1",
  fullName: "Laura Cordero Márquez",
  phone: "667 234 3135",
  email: "laura@gmail.com",
  hasActiveCredit: false,
};

const MOCK_LINE_ITEMS: DiscountRequestLineItem[] = [
  {
    id: "1",
    code: "01-SA-1007",
    name: "Sala Esquinera Valencia Beige",
    brand: "Herwong",
    quantity: 1,
    originalPrice: 20999,
    discountAmount: 8400,
    total: 12599,
  },
];

const DELIVERY_OPTIONS: { value: "a_domicilio" | "recoger_sucursal"; label: string }[] = [
  { value: "a_domicilio", label: "A domicilio" },
  { value: "recoger_sucursal", label: "Recoger en sucursal" },
];

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function NuevaSolicitudDescuentoPage() {
  const router = useRouter();

  const [discountReason, setDiscountReason] = useState("Última pieza");
  const [saleType, setSaleType] = useState<SaleTypeForm>("contado");
  const [client, setClient] = useState<ClientSummary | null>(MOCK_CLIENT);
  const [lineItems, setLineItems] = useState<DiscountRequestLineItem[]>(MOCK_LINE_ITEMS);
  const [deliveryType, setDeliveryType] = useState<"a_domicilio" | "recoger_sucursal">("a_domicilio");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Circuito Universitario 2322. Colonia Universidad Culiacán Sinaloa"
  );
  const [deliveryEmail, setDeliveryEmail] = useState("jose.montes@gmail.com");
  const [receiverPhone, setReceiverPhone] = useState("667 333 4512");

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = 240;
  const total = subtotal + shipping;
  const enganchePercent = 10;
  const engancheAmount = total * (enganchePercent / 100);

  const handleSaleTypeChange = (_: React.MouseEvent<HTMLElement>, newValue: SaleTypeForm | null) => {
    if (newValue) setSaleType(newValue);
  };

  const handleDeliveryChange = (event: SelectChangeEvent<string>) => {
    setDeliveryType(event.target.value as "a_domicilio" | "recoger_sucursal");
  };

  const handleChangeClient = useCallback(() => {
    // Mock: in production would open client search modal
    setClient(MOCK_CLIENT);
  }, []);

  const handleChangeAddress = useCallback(() => {
    // Mock: in production would open address picker/modal
    setDeliveryAddress("Circuito Universitario 2322. Colonia Universidad Culiacán Sinaloa");
    setDeliveryEmail("jose.montes@gmail.com");
  }, []);

  const handleChangeReceiverPhone = useCallback(() => {
    // Mock: in production would open phone editor modal
    setReceiverPhone("667 333 4512");
  }, []);

  const handleCancel = useCallback(() => {
    router.push("/solicitudes-descuento");
  }, [router]);

  const handleSubmit = useCallback(() => {
    if (!client) return;
    // Mock: in production would call API to create discount request
    console.log("[NuevaSolicitudDescuento] Submit", {
      discountReason,
      saleType,
      client,
      lineItems,
      deliveryType,
      deliveryAddress,
      subtotal,
      shipping,
      total,
      engancheAmount,
    });
    router.push("/solicitudes-descuento");
  }, [
    client,
    discountReason,
    saleType,
    lineItems,
    deliveryType,
    deliveryAddress,
    subtotal,
    shipping,
    total,
    engancheAmount,
    router,
  ]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Solicitudes de descuentos", href: "/solicitudes-descuento" },
    { label: "Nueva solicitud" },
  ];

  return (
    <MainLayout>
      <Breadcrumbs
        items={breadcrumbs}
        showBackButton
        onBack={() => router.push("/solicitudes-descuento")}
      />

      <HeaderSection>
        <TitleSection>
          <PageTitle>Nueva solicitud de descuento</PageTitle>
        </TitleSection>
        <ActionsSection>
          <ActionButton variant="outlined" color="error" onClick={handleCancel}>
            Rechazar
          </ActionButton>
          <ActionButton
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!client || lineItems.length === 0}
          >
            Aprobar
          </ActionButton>
        </ActionsSection>
      </HeaderSection>

      <PageContainer>
        <MainContent>
          <DiscountCard>
            <Stack flex={1}>
              <Typography variant="subtitle1">Descuento solicitado</Typography>
              <Typography variant="body2" color="text.secondary">Motivo: Última pieza</Typography>
            </Stack>
            <PendingBadge>
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" color="error">Pendiente de autorización</Typography>
            </PendingBadge>
          </DiscountCard>

          <SectionCard>
            <Typography variant="h6">Artículos</Typography>
            <Typography variant="body2" color="text.secondary">Agrega los artículos para este cliente.</Typography>
            <ItemsList>
              {lineItems.map((item) => (
                <DiscountRequestItemCard key={item.id} item={item} />
              ))}
            </ItemsList>

            <Stack spacing={4} mt={2}>
              <Stack direction="row" justifyContent="space-between" alignContent="center">
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="subtitle1">{formatCurrency(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignContent="center">
                <Typography variant="body1">Envío</Typography>
                <Typography variant="subtitle1">{formatCurrency(shipping)}</Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignContent="center"
                style={{
                  background: colors.chip.background,
                  borderRadius: '8px',
                  marginLeft: '-12px',
                  marginRight: '-12px',
                  padding: '12px',
                }}>
                <Typography variant="body1" fontWeight={600}>Total</Typography>
                <Typography variant="h5" fontWeight={600}>{formatCurrency(total)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignContent="center">
                <Typography variant="body1">Enganche solicitado ({enganchePercent}%)</Typography>
                <Typography variant="subtitle1">{formatCurrency(engancheAmount)}</Typography>
              </Stack>
            </Stack>
          </SectionCard>
        </MainContent>

        <SidePanel>
          <SectionCard>
            <SectionTitle>Tipo de venta</SectionTitle>
            <ToggleButtonGroup
              value={saleType}
              exclusive
              onChange={handleSaleTypeChange}
              fullWidth
              size="small"
              sx={{
                "& .MuiToggleButtonGroup-grouped": {
                  border: `1px solid ${colors.border}`,
                  "&.Mui-selected": {
                    backgroundColor: colors.sidebar?.itemSelected ?? "#F0F6FF",
                    color: colors.sidebar?.textSelected ?? "#2663EB",
                    "&:hover": {
                      backgroundColor: colors.sidebar?.itemSelected ?? "#F0F6FF",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="credito">Crédito</ToggleButton>
              <ToggleButton value="contado">Contado</ToggleButton>
              <ToggleButton value="apartado">Apartado</ToggleButton>
            </ToggleButtonGroup>
          </SectionCard>

          <SectionCard>
            <SectionHeader>
              <SectionTitle sx={{ marginBottom: 0 }}>Cliente</SectionTitle>
              <ChangeLink onClick={handleChangeClient}>Cambiar</ChangeLink>
            </SectionHeader>
            {client ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <ClientName>{client.fullName}</ClientName>
                  <ActiveChip label="Activo" size="small" />
                </Box>
                <ClientDetail>{client.phone}</ClientDetail>
                <ClientDetail>{client.email}</ClientDetail>
                {!client.hasActiveCredit && (
                  <ClientNotice>Este cliente no cuenta con crédito activo.</ClientNotice>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Selecciona un cliente
              </Typography>
            )}
          </SectionCard>

          <SectionCard>
            <SectionTitle sx={{ marginBottom: 2 }}>Entrega</SectionTitle>
            <FormControl fullWidth size="small" sx={{ mb: 0 }}>
              <InputLabel id="delivery-type-label">Tipo de entrega</InputLabel>
              <Select
                labelId="delivery-type-label"
                value={deliveryType}
                label="Tipo de entrega"
                onChange={handleDeliveryChange}
                sx={{
                  backgroundColor: colors.background.sidebar,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.sidebar?.textSelected,
                    borderWidth: 2,
                  },
                }}
              >
                {DELIVERY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <MapPlaceholder>
              <MapIcon sx={{ fontSize: 20, color: "#71717A" }} />
              <Typography component="span" variant="body2" sx={{ color: "#71717A" }}>
                Mapa de entrega
              </Typography>
            </MapPlaceholder>
            <DeliveryFieldBlock>
              <DeliveryFieldLabel>Dirección de entrega</DeliveryFieldLabel>
              <DeliveryFieldRow>
                <DeliveryFieldValue>
                  <DeliveryFieldText>{deliveryAddress}</DeliveryFieldText>
                  <DeliveryFieldSecondary>{deliveryEmail}</DeliveryFieldSecondary>
                </DeliveryFieldValue>
                <ChangeLink onClick={handleChangeAddress}>Cambiar</ChangeLink>
              </DeliveryFieldRow>
            </DeliveryFieldBlock>
            <DeliveryFieldBlock>
              <DeliveryFieldLabel>Teléfono de quien recibe</DeliveryFieldLabel>
              <DeliveryFieldRow>
                <DeliveryFieldValue>
                  <DeliveryFieldText>{receiverPhone}</DeliveryFieldText>
                </DeliveryFieldValue>
                <ChangeLink onClick={handleChangeReceiverPhone}>Cambiar</ChangeLink>
              </DeliveryFieldRow>
            </DeliveryFieldBlock>
          </SectionCard>
        </SidePanel>
      </PageContainer>
    </MainLayout>
  );
}
