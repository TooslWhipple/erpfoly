import { Button, Grid, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import {
    FormCard,
    DeleteButton,
    DeleteButtonWrapper
} from "@/styles/catalogos/proveedores.styles";
import type { SupplierContact } from "./types";
import { POSITION_OPTIONS } from "./constants";
import { Trash } from "lucide-react";

export interface ContactsTabProps {
    contacts: SupplierContact[];
    onAddContact: () => void;
    onRemoveContact: (contactId: string) => void;
    onContactChange: (
        contactId: string,
        field: keyof SupplierContact,
        value: string
    ) => void;
}

export function ContactsTab({
    contacts,
    onAddContact,
    onRemoveContact,
    onContactChange,
}: ContactsTabProps) {
    return (
        <FormCard>
            <Stack spacing={3} width="100%">
                {contacts.map((contact, index) => {
                    const isRequired = index <= 1; // First two contacts are required and cannot be removed
                    return (
                        <Stack key={contact.id} spacing={3} width="100%">
                            <Grid container spacing={1} alignItems="center">
                                <Grid size={{ xs: 12, md: 1 }}>
                                    <FormSelect
                                        label="Cargo"
                                        placeholder="Selecciona..."
                                        value={contact.position}
                                        onChange={(e) =>
                                            onContactChange(
                                                contact.id,
                                                "position",
                                                String(e.target.value)
                                            )
                                        }
                                        options={POSITION_OPTIONS}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: "grow" }}>
                                    <FormTextField
                                        label="Nombre"
                                        placeholder="Ingresa"
                                        value={contact.name}
                                        onChange={(e) =>
                                            onContactChange(
                                                contact.id,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: "grow" }}>
                                    <FormTextField
                                        label="Número"
                                        placeholder="Ingresa"
                                        type="tel"
                                        value={contact.phone}
                                        onChange={(e) =>
                                            onContactChange(
                                                contact.id,
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                                {!isRequired && (
                                    <>
                                        <Grid
                                            size={{ xs: "auto" }}
                                            sx={{
                                                display: { xs: "none", md: "block" },
                                                alignSelf: "flex-end",
                                            }}
                                        >
                                            <DeleteButton
                                                size="small"
                                                onClick={() =>
                                                    onRemoveContact(contact.id)
                                                }
                                            >
                                                <Trash size={16} />
                                            </DeleteButton>
                                        </Grid>
                                        <DeleteButtonWrapper>
                                            <DeleteButton
                                                size="small"
                                                onClick={() =>
                                                    onRemoveContact(contact.id)
                                                }
                                                sx={{
                                                    display: {
                                                        xs: "block",
                                                        sm: "none",
                                                    },
                                                }}
                                            >
                                                <Trash size={16} />
                                            </DeleteButton>
                                        </DeleteButtonWrapper>
                                    </>
                                )}
                            </Grid>
                        </Stack>
                    );
                })}
            </Stack>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAddContact}
            >
                Agregar otro
            </Button>
        </FormCard>
    );
}
