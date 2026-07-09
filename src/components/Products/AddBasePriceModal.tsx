import { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { FormTextField } from "@/components";
import { SideModal } from "@/components/SideModal";
import { theme } from "@/styles/theme";
import { useProductPricePreview } from "@/hooks/useProductPricePreview";
import {
    parsePercentFieldInput,
    sanitizeIntegerPercentInput,
    MIN_PROFIT_MARGIN_PERCENT,
    MAX_PROFIT_MARGIN_PERCENT,
} from "@/utils/percentInput";
import type { ProductBasePrice } from "@/types/productos.types";

export interface AddBasePriceModalProps {
    open: boolean;
    onClose: () => void;
    referenceCost: number;
    onAdd: (entry: Omit<ProductBasePrice, "id">) => void;
    editedByLabel?: string;
}

function parseMarginPercent(raw: string): number | null {
    const n = parsePercentFieldInput(raw);
    if (n === null || n < MIN_PROFIT_MARGIN_PERCENT || n > MAX_PROFIT_MARGIN_PERCENT) return null;
    return n;
}

export function AddBasePriceModal({
    open,
    onClose,
    referenceCost,
    onAdd,
    editedByLabel = "Usuario actual",
}: AddBasePriceModalProps) {
    const [name, setName] = useState("");
    const [marginPercent, setMarginPercent] = useState("");

    useEffect(() => {
        if (open) {
            setName("");
            setMarginPercent("");
        }
    }, [open]);

    const marginParsed = useMemo(() => parseMarginPercent(marginPercent), [marginPercent]);

    const {
        subtotal: calculatedSubtotal,
        price: calculatedPrice,
        isLoading: calculatedPriceLoading,
        isError: calculatedPriceError,
    } = useProductPricePreview(Math.max(0, referenceCost), marginParsed ?? 0, {
        enabled: marginParsed !== null,
    });

    const canSubmit = name.trim().length > 0 && marginParsed !== null;

    const handleSubmit = () => {
        if (!canSubmit || marginParsed === null) return;
        onAdd({
            name: name.trim(),
            marginPercent: marginParsed,
            lastEditedBy: editedByLabel,
        });
        onClose();
    };

    return (
        <SideModal
            open={open}
            onClose={onClose}
            maxWidth="sm"
            title="Agregar precio"
            description="Agrega un nuevo cálculo de precio"
        >
            <Stack spacing={2} sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField
                            label="Nombre"
                            placeholder="Ej. Contado 3 meses"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField
                            label="Margen (%)"
                            placeholder="Ej. 20"
                            value={marginPercent}
                            onChange={(e) => setMarginPercent(sanitizeIntegerPercentInput(e.target.value))}
                            fullWidth
                            slotProps={{
                                htmlInput: { inputMode: "numeric" },
                            }}
                            helperText={`Número entero entre ${MIN_PROFIT_MARGIN_PERCENT} y ${MAX_PROFIT_MARGIN_PERCENT}.`}
                        />
                    </Grid>
                </Grid>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "#E2E8F0",
                        textAlign: "right",
                        gap: "4px",
                    }}
                >
                    {
                        calculatedPriceLoading ? (
                            <CircularProgress size={16} />
                        ) : calculatedPriceError ? (
                            <Typography variant="body2" fontWeight={700} color="text.primary">No se pudo calcular</Typography>
                        ) : (
                            <>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Precio:</Typography>
                                    <Typography variant="body2" fontWeight={700} color="text.primary">
                                        {numeral(calculatedSubtotal).format("$0,0.00")}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Precio final:</Typography>
                                    <Typography variant="body2" fontWeight={700} color="text.primary">
                                        {numeral(calculatedPrice).format("$0,0.00")}
                                    </Typography>
                                </Stack>
                            </>
                        )
                    }
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                >
                    Agregar
                </Button>
            </Stack>
        </SideModal>
    );
}
