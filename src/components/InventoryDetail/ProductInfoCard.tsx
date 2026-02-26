import { Typography, Button, Stack } from "@mui/material";
import { PencilLine as EditIcon } from "lucide-react";
import { CardContainer } from "./styles";

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

export function ProductInfoCard({
    title,
    subtitle,
    fields = [],
    onEdit,
    showEditButton = true,
    children,
}: ProductInfoCardProps) {
    return (
        <CardContainer>
            <Stack direction="row" justifyContent="space-between">
                <Stack>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
                </Stack>
                {
                    (showEditButton) &&
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon size={16} />}
                        onClick={onEdit}
                    >
                        Editar
                    </Button>
                }
            </Stack>

            {
                children ?
                    <>{children}</>
                    :
                    <Stack spacing={2}>
                        {
                            fields.map((field, index) => (
                                <Stack key={index} direction="row" spacing={1}>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500} minWidth={"124px"}>{field.label}</Typography>
                                    <Typography variant="body1" color="text.primary">{field.value}</Typography>
                                </Stack>
                            ))
                        }
                    </Stack>
            }
        </CardContainer>
    );
}
