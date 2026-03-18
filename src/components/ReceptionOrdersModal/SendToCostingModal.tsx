import { Dialog, CircularProgress, Typography, Stack, Button } from "@mui/material";
import { X as Close } from 'lucide-react'
import {
    DialogContent,
    ModalHeader,
    CloseButton,
    ModalActions,
    StatsContainer,
    StatItem,
} from "./SendToCostingModal.styles";
import { colors } from "@/styles/theme";

interface SendToCostingModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    totalArticles: number;
    totalLabels: number;
    loading?: boolean;
}

export function SendToCostingModal({
    open,
    onClose,
    onConfirm,
    totalArticles,
    totalLabels,
    loading = false,
}: SendToCostingModalProps) {
    const handleClose = () => {
        if (!loading) {
            onClose();
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
                },
            }}
        >
            <DialogContent>
                <CloseButton onClick={handleClose} disabled={loading} size="small">
                    <Close size={12} color={colors.text.primary} />
                </CloseButton>

                <Stack spacing={3}>
                    <Stack spacing={0.5}>
                        <Typography variant="h5" fontWeight={600}>Guardar e imprimir etiquetas</Typography>
                        <Typography variant="body2" color="text.secondary">
                            ¿Estás seguro que deseas confirmar la cantidad de artículos recibidos? Una
                            vez confirmados se imprimirán las etiquetas de control interno.
                        </Typography>
                    </Stack>
                    <StatsContainer>
                        <StatItem>
                            <Typography variant="body2" color="text.secondary">Total de artículos</Typography>
                            <Typography variant="body1" fontWeight={600}>{totalArticles}</Typography>
                        </StatItem>
                        <StatItem>
                            <Typography variant="body2" color="text.secondary">Etiquetas a imprimir</Typography>
                            <Typography variant="body1" fontWeight={600}>{totalLabels}</Typography>
                        </StatItem>
                    </StatsContainer>
                </Stack>

                <ModalActions>
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Guardar e imprimir etiquetas"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                </ModalActions>
            </DialogContent>
        </Dialog>
    );
}
