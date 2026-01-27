import { Box, Typography, Button } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import {
    InfoCardContainer,
    InfoCardHeader,
    InfoCardContent,
    InfoField,
    EditButton,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InfoFieldData {
    label: string;
    value: string;
}

export interface ProductInfoCardProps {
    title: string;
    subtitle: string;
    fields?: InfoFieldData[];
    onEdit?: () => void;
    showEditButton?: boolean;
    children?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProductInfoCard({
    title,
    subtitle,
    fields = [],
    onEdit,
    showEditButton = true,
    children,
}: ProductInfoCardProps) {
    return (
        <InfoCardContainer>
            <InfoCardHeader>
                <Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
                {showEditButton && (
                    <EditButton
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        variant="outlined"
                        size="small"
                    >
                        Editar
                    </EditButton>
                )}
            </InfoCardHeader>

            {children ? (
                <>{children}</>
            ) : (
                <InfoCardContent>
                    {fields.map((field, index) => (
                        <InfoField key={index}>
                            <Typography variant="body2" color="text.secondary">{field.label}</Typography>
                            <Typography variant="body1" color="text.primary">{field.value}</Typography>
                        </InfoField>
                    ))}
                </InfoCardContent>
            )}
        </InfoCardContainer>
    );
}
