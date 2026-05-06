import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { FormTextField } from "@/components";
import { SideModal } from "@/components/SideModal";
import { theme } from "@/styles/theme";
import type { ProductBasePrice } from "@/types/productos.types";

export interface AddBasePriceModalProps {
    open: boolean;
    onClose: () => void;
    referenceCost: number;
    onAdd: (entry: Omit<ProductBasePrice, "id">) => void;
    editedByLabel?: string;
}

function parseMarginPercent(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    if (Number.isNaN(n) || n < 0) return null;
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

    const calculatedPrice = useMemo(() => {
        if (marginParsed === null) return null;
        const safeCost = Math.max(0, referenceCost);
        return safeCost * (1 + marginParsed / 100);
    }, [referenceCost, marginParsed]);

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
                            placeholder="0.00"
                            type="number"
                            value={marginPercent}
                            onChange={(e) => setMarginPercent(e.target.value)}
                            fullWidth
                            inputProps={{ min: 0, step: "0.01" }}
                        />
                    </Grid>
                </Grid>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "#E2E8F0",
                        textAlign: "right",
                        gap: "8px",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">Precio después del cálculo:</Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary">{numeral(calculatedPrice ?? 0).format("$0,0.00")}</Typography>
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
