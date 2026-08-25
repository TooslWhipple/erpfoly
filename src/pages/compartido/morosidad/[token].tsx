import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Title, TableCrud } from "@/components";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { FormTextField } from "@/components/Form";
import {
  getPublicDelinquencySharedList,
  requestPublicDelinquencyAccess,
  verifyPublicDelinquencyOtp,
} from "@/services/public-delinquency-shared-list.service";
import type { PublicDelinquencySharedListView } from "@/types/delinquency-shared-list.types";
import type { DelinquencyPeriod } from "@/types/delinquency.types";
import { formatDate, formatDateOnly } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const DATE_FORMAT = "D [de] MMMM, YYYY";
const STORAGE_KEY_PREFIX = "delinquency-shared-access:";

const DELINQUENCY_CHIP_LABELS: Record<string, string> = {
  "1_day": "1 día",
  "1_week": "1 semana",
  "1_month": "1 mes",
  "2_months": "2 meses",
};

const DELINQUENCY_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  "1_day": "default",
  "1_week": "error",
  "1_month": "error",
  "2_months": "error",
};

type Step = "email" | "otp" | "list";

export default function PublicDelinquencySharedListPage() {
  const router = useRouter();
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const shareToken = typeof router.query.token === "string" ? router.query.token : "";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState<PublicDelinquencySharedListView | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}${shareToken}`;

  const loadList = useCallback(
    async (token: string) => {
      if (!shareToken) return;
      setLoading(true);
      try {
        const data = await getPublicDelinquencySharedList(shareToken, token);
        setListData(data);
        setStep("list");
      } catch {
        sessionStorage.removeItem(storageKey);
        setAccessToken(null);
        setStep("email");
        showError("Tu sesión expiró. Verifica tu correo nuevamente.");
      } finally {
        setLoading(false);
      }
    },
    [shareToken, showError, storageKey],
  );

  useEffect(() => {
    if (!router.isReady || !shareToken) return;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      setAccessToken(stored);
      void loadList(stored);
    }
  }, [router.isReady, shareToken, storageKey, loadList]);

  const columns: Column<PublicDelinquencySharedListView["clients"][number]>[] = useMemo(
    () => [
      {
        id: "fullName",
        label: "CLIENTE",
        size: "xl",
      },
      {
        id: "phone",
        label: "TELÉFONO",
        size: "md",
        format: (value) => (value ? String(value) : "—"),
      },
      {
        id: "lastPaymentDate",
        label: "ÚLTIMO PAGO",
        size: "md",
        format: (value) =>
          value ? formatDate(value, DATE_FORMAT) : "—",
      },
      {
        id: "dueDate",
        label: "Fecha de vencimiento",
        size: "lg",
        format: (value) => formatDateOnly(value, DATE_FORMAT),
      },
      {
        id: "delinquencyPeriod",
        label: "MOROSIDAD",
        size: "sm",
        type: "chip",
        align: "center",
        chipLabelMap: DELINQUENCY_CHIP_LABELS,
        chipVariantMap: DELINQUENCY_CHIP_VARIANTS,
      },
      {
        id: "debtAmount",
        label: "DEUDA",
        type: "currency",
        size: "md",
        align: "right",
      },
    ],
    [],
  );

  const handleRequestAccess = async () => {
    if (!shareToken || !email.trim()) {
      showError("Ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    try {
      await requestPublicDelinquencyAccess(shareToken, email.trim().toLowerCase());
      showSuccess("Se envió un código de verificación a tu correo");
      setStep("otp");
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!shareToken || !email.trim() || !otpCode.trim()) {
      showError("Ingresa el código de verificación");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPublicDelinquencyOtp(
        shareToken,
        email.trim().toLowerCase(),
        otpCode.trim(),
      );
      sessionStorage.setItem(storageKey, result.accessToken);
      setAccessToken(result.accessToken);
      await loadList(result.accessToken);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  if (!router.isReady) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!shareToken) {
    return (
      <Stack spacing={2} maxWidth={480} mx="auto" py={6} px={2}>
        <Alert severity="error">Enlace inválido</Alert>
      </Stack>
    );
  }

  if (step === "list" && listData) {
    return (
      <Stack spacing={3} maxWidth={1200} mx="auto" py={4} px={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Title title={listData.name} />
            <Typography variant="body2" color="text.secondary">
              {listData.clientCount.toLocaleString("es-MX")} clientes compartidos
            </Typography>
          </Box>
        </Stack>

        <TableCrud
          columns={columns}
          rows={listData.clients}
          rowKey="id"
          hidePagination
          loading={loading}
          emptyMessage="No hay clientes en esta lista"
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3} maxWidth={480} mx="auto" py={6} px={2}>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Base de clientes compartida
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Ingresa el correo autorizado para acceder a la información.
        </Typography>
      </Box>

      <FormTextField
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
        disabled={step === "otp" || loading}
      />

      {step === "otp" && (
        <FormTextField
          label="Código de verificación"
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          fullWidth
          disabled={loading}
        />
      )}

      <Button
        variant="contained"
        onClick={() =>
          void (step === "otp" ? handleVerifyOtp() : handleRequestAccess())
        }
        disabled={loading}
      >
        {loading ? "Procesando..." : step === "otp" ? "Verificar código" : "Continuar"}
      </Button>

      {step === "otp" && (
        <Button variant="text" onClick={() => setStep("email")} disabled={loading}>
          Usar otro correo
        </Button>
      )}

      {accessToken && loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress size={24} />
        </Box>
      )}
    </Stack>
  );
}
