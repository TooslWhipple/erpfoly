import { useState, useCallback, Fragment } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { Clock9 } from "lucide-react";
import { MainLayout, Breadcrumbs, DiscountRequestItemCard, StatusChip } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type {
  ClientSummary,
  DiscountRequestLineItem,
  SaleTypeForm,
} from "@/types/discount-requests.types";
import {
  DiscountCard,
  SectionCard,
  SectionGrayCard,
  ChangeLink,
  ItemsList,
  MapPlaceholder,
  TotalCard
} from "@/styles/solicitudes-descuento/nuevo.styles";
import { colors } from "@/styles/theme";

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
      <Stack spacing={2}>
        <Stack
          spacing={2}
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between">

          <Breadcrumbs
            items={breadcrumbs}
            showBackButton
            onBack={() => router.push("/solicitudes-descuento")}
          />


          <Stack direction="row" spacing={2}>
            {
              (!client || lineItems.length === 0) ?
                <Fragment>
                  <Skeleton width={112} height={24} />
                  <Skeleton width={112} height={24} />
                </Fragment>
                :
                <Fragment>
                  <Button
                    variant="contained"
                    color="error"
                    style={{ width: 112 }}
                    onClick={handleCancel}>
                    Rechazar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ width: 112 }}
                    onClick={handleSubmit}>
                    Aprobar
                  </Button>
                </Fragment>
            }
          </Stack>

        </Stack>
        <Typography variant="h4" fontWeight={600}>Nueva solicitud de descuento</Typography>
        <Divider />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <DiscountCard>
                <Stack flex={1}>
                  <Typography variant="subtitle1">Descuento solicitado</Typography>
                  <Typography variant="body2" color="text.secondary">Motivo: Última pieza</Typography>
                </Stack>
                <StatusChip
                  label="Pendiente de autorización"
                  variant="pending"
                  size="small"
                  startIcon={<Clock9 size={12} />}
                />
              </DiscountCard>
              <SectionCard>
                <Stack>
                  <Typography variant="h6">Artículos</Typography>
                  <Typography variant="body2" color="text.secondary">Agrega los artículos para este cliente.</Typography>
                </Stack>

                {
                  lineItems.length == 0 ?
                    [1, 2, 3].map((item) => (
                      <Skeleton key={item} width="100%" height="144px" />
                    ))
                    :
                    <ItemsList>
                      {
                        lineItems.map((item) => (
                          <DiscountRequestItemCard key={item.id} item={item} />
                        ))
                      }
                    </ItemsList>
                }

                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>{formatCurrency(subtotal)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography variant="body1">Envío</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>{formatCurrency(shipping)}</Typography>
                  </Stack>
                  <TotalCard>
                    <Typography variant="body1" fontWeight={600}>Total</Typography>
                    <Typography variant="h5" fontWeight={600}>{formatCurrency(total)}</Typography>
                  </TotalCard>
                  <Stack direction="row" justifyContent="space-between" alignContent="center">
                    <Typography variant="body1">Enganche solicitado ({enganchePercent}%)</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>{formatCurrency(engancheAmount)}</Typography>
                  </Stack>
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <SectionGrayCard>
                <Typography variant="h6">Tipo de venta</Typography>
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
              </SectionGrayCard>

              <SectionGrayCard>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="nowrap">
                  <Typography variant="h6">Cliente</Typography>
                  <ChangeLink onClick={handleChangeClient}>Cambiar</ChangeLink>
                </Stack>

                {
                  client ?
                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="nowrap">
                        <Typography variant="body1" fontWeight={500}>{client.fullName}</Typography>
                        <StatusChip label="Activo" variant="success" size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{client.phone}</Typography>
                      <Typography variant="body2" color="text.secondary">{client.email}</Typography>
                      {
                        !client.hasActiveCredit &&
                        <Typography variant="body2" color="text.secondary">Este cliente no cuenta con crédito activo.</Typography>
                      }
                    </Stack>
                    :
                    <Typography variant="body2" color="text.secondary">
                      Selecciona un cliente
                    </Typography>
                }
              </SectionGrayCard>

              <SectionGrayCard>
                <Typography variant="h6">Entrega</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={deliveryType}
                    onChange={handleDeliveryChange}
                    sx={{
                      backgroundColor: "transparent"
                    }}
                  >
                    {
                      DELIVERY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
                <MapPlaceholder />
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" flexWrap="nowrap">
                    <Typography variant="caption" fontWeight={500}>Dirección de entrega</Typography>
                    <ChangeLink onClick={handleChangeAddress}>Cambiar</ChangeLink>
                  </Stack>
                  <Typography variant="body1" fontWeight={500}>{deliveryAddress}</Typography>
                  <Typography variant="body2" color="text.secondary">{deliveryEmail}</Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" flexWrap="nowrap">
                    <Typography variant="caption" fontWeight={500}>Teléfono de quien recibe</Typography>
                    <ChangeLink onClick={handleChangeReceiverPhone}>Cambiar</ChangeLink>
                  </Stack>
                  <Typography variant="body1" fontWeight={500}>{receiverPhone}</Typography>
                </Stack>
              </SectionGrayCard>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </MainLayout>
  );
}
