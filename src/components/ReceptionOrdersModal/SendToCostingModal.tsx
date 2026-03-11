import { Dialog, CircularProgress, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
    DialogContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
    ModalActions,
    ConfirmButton,
    ModalContent,
    StatsContainer,
    StatItem,
    StatLabel,
    StatValue,
} from "./SendToCostingModal.styles";

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
                <ModalHeader>
                    <ModalTitle>Enviar a costeo</ModalTitle>
                    <CloseButton onClick={handleClose} disabled={loading} size="small">
                        <CloseIcon />
                    </CloseButton>
                </ModalHeader>

                <ModalContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        ¿Estás seguro que deseas enviar la recepción a costeo? Una vez confirmado
                        se enviarán los datos para su procesamiento.
                    </Typography>

                    <StatsContainer>
                        <StatItem>
                            <StatLabel>Total de artículos</StatLabel>
                            <StatValue>{totalArticles}</StatValue>
                        </StatItem>
                        <StatItem>
                            <StatLabel>Etiquetas a imprimir</StatLabel>
                            <StatValue>{totalLabels}</StatValue>
                        </StatItem>
                    </StatsContainer>
                </ModalContent>

                <ModalActions>
                    <ConfirmButton
                        type="button"
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Guardar e imprimir etiquetas"
                        )}
                    </ConfirmButton>
                </ModalActions>
            </DialogContent>
        </Dialog>
    );
}
