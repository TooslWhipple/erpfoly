import { Button, Grid, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import {
    FormCard,
    DeleteButton,
    DeleteButtonWrapper
} from "@/styles/catalogos/proveedores.styles";
import { SUPPLIER_TEXT_MAX_LENGTH } from "@/hooks/proveedores/supplierForm.constants";
import type { SupplierContact } from "@/types/proveedores.types";
import { Trash } from "lucide-react";

export interface ContactOption {
    value: number;
    label: string;
}

export interface ContactsTabProps {
    contacts: SupplierContact[];
    jobTitleOptions: ContactOption[];
    errors: Record<string, string>;
    onAddContact: () => void;
    onRemoveContact: (contactId: string) => void;
    onContactChange: (
        contactId: string,
        contactIndex: number,
        field: keyof SupplierContact,
        value: string | number | null
    ) => void;
}

export function ContactsTab({
    contacts,
    jobTitleOptions,
    errors,
    onAddContact,
    onRemoveContact,
    onContactChange,
}: ContactsTabProps) {
    const jobTitleSelectOptions = jobTitleOptions.map((o) => ({
        value: String(o.value),
        label: o.label,
    }));

    return (
        <FormCard>
            <Stack spacing={3} width="100%">
                {contacts.map((contact, index) => {
                    const isRequired = index === 0;
                    const fieldPrefix = `contacts.${index}`;
                    const jobTitleError = errors[`${fieldPrefix}.jobTitleId`];
                    const nameError = errors[`${fieldPrefix}.name`];
                    const phoneError = errors[`${fieldPrefix}.phone`];
                    return (
                        <Stack key={contact.id} spacing={3} width="100%">
                            <Grid container spacing={2} alignItems="flex-start">
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <FormSelect
                                        label="Cargo"
                                        placeholder="Selecciona..."
                                        value={
                                            contact.jobTitleId != null
                                                ? String(contact.jobTitleId)
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            onContactChange(
                                                contact.id,
                                                index,
                                                "jobTitleId",
                                                v === ""
                                                    ? null
                                                    : Number(v)
                                            );
                                        }}
                                        options={jobTitleSelectOptions}
                                        required={isRequired}
                                        error={Boolean(jobTitleError)}
                                        helperText={jobTitleError}
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
                                                index,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        required={isRequired}
                                        error={Boolean(nameError)}
                                        helperText={nameError}
                                        inputProps={{ maxLength: SUPPLIER_TEXT_MAX_LENGTH }}
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
                                                index,
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        required={isRequired}
                                        error={Boolean(phoneError)}
                                        helperText={phoneError}
                                        inputProps={{ maxLength: 10 }}
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
