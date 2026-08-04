import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Copy } from "lucide-react";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import dayjs from "@/lib/dayjs";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { SupplierPortalStatus } from "@/services/suppliers.service";

export interface PortalAccessStatusProps {
    portalStatus: SupplierPortalStatus;
    inviteUrl: string | null;
    inviteExpiresAt: string | null;
}

export function PortalAccessStatus({
    portalStatus,
    inviteUrl,
    inviteExpiresAt,
}: PortalAccessStatusProps) {
    const showSuccess = useSnackbarStore((s) => s.showSuccess);
    const showError = useSnackbarStore((s) => s.showError);

    if (portalStatus === "NONE") return null;

    const handleCopy = async () => {
        if (!inviteUrl) return;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            showSuccess("URL de invitación copiada.");
        } catch {
            showError("No se pudo copiar la URL.");
        }
    };

    if (portalStatus === "ACTIVE") {
        return (
            <Box>
                <StatusChip label="Proveedor con acceso activo" variant="success" />
            </Box>
        );
    }

    if (!inviteUrl) {
        return (
            <Stack spacing={1}>
                <StatusChip label="Invitación expirada" variant="error" />
                <Typography variant="body2" color="text.secondary">
                    El enlace de invitación venció. Genera uno nuevo con el botón
                    &quot;Enviar invitación&quot;.
                </Typography>
            </Stack>
        );
    }

    const hoursLeft = inviteExpiresAt
        ? Math.max(0, Math.ceil(dayjs(inviteExpiresAt).diff(dayjs(), "hour", true)))
        : null;

    return (
        <Stack spacing={1}>
            <StatusChip label="Invitación pendiente" variant="pending" />
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        bgcolor: "action.hover",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                    }}
                >
                    {inviteUrl}
                </Typography>
                <Tooltip title="Copiar URL">
                    <IconButton size="small" onClick={handleCopy}>
                        <Copy size={16} />
                    </IconButton>
                </Tooltip>
            </Stack>
            {hoursLeft != null && inviteExpiresAt && (
                <Typography variant="caption" color="text.secondary">
                    Expira en {hoursLeft}h ({dayjs(inviteExpiresAt).format("D MMM, HH:mm")})
                </Typography>
            )}
        </Stack>
    );
}
