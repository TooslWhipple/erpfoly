import { Button, Grid, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { FormTextField, FormSelect } from "@/components";
import {
    FormCard,
    DynamicListItem,
    DeleteButton,
    DeleteButtonWrapper
} from "@/styles/catalogos/proveedores.styles";
import { SUPPLIER_TEXT_MAX_LENGTH } from "@/hooks/proveedores/supplierForm.constants";
import type { BankAccount, CreditData } from "@/types/proveedores.types";
import type { ContactOption } from "./ContactsTab";
import { Trash } from "lucide-react";

export interface CreditTabProps {
    creditData: CreditData;
    bankAccounts: BankAccount[];
    jobTitleOptions: ContactOption[];
    errors: Record<string, string>;
    onCreditDataChange: (field: keyof CreditData, value: string | number | null) => void;
    onAddBankAccount: () => void;
    onRemoveBankAccount: (accountId: string) => void;
    onBankAccountChange: (
        accountId: string,
        field: keyof BankAccount,
        value: string
    ) => void;
}

export function CreditTab({
    creditData,
    bankAccounts,
    jobTitleOptions,
    errors,
    onCreditDataChange,
    onAddBankAccount,
    onRemoveBankAccount,
    onBankAccountChange,
}: CreditTabProps) {
    const jobTitleSelectOptions = jobTitleOptions.map((o) => ({
        value: String(o.value),
        label: o.label,
    }));
    const attentionError = errors["creditData.attention"];
    const jobTitleError = errors["creditData.jobTitleId"];
    const phoneError = errors["creditData.phone"];

    return (
        <Stack spacing={2} width="100%">
            <FormCard>
                <Typography variant="h6">Crédito y cobranza</Typography>
                <Grid container spacing={2} width="100%">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormTextField
                            label="Atención"
                            placeholder="Ingresar"
                            value={creditData.attention}
                            onChange={(e) =>
                                onCreditDataChange("attention", e.target.value)
                            }
                            required
                            error={Boolean(attentionError)}
                            helperText={attentionError}
                            inputProps={{ maxLength: SUPPLIER_TEXT_MAX_LENGTH }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormSelect
                            label="Puesto"
                            placeholder="Selecciona..."
                            value={
                                creditData.jobTitleId != null
                                    ? String(creditData.jobTitleId)
                                    : ""
                            }
                            onChange={(e) => {
                                const v = e.target.value;
                                onCreditDataChange(
                                    "jobTitleId",
                                    v === "" ? null : Number(v)
                                );
                            }}
                            options={jobTitleSelectOptions}
                            required
                            error={Boolean(jobTitleError)}
                            helperText={jobTitleError}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormTextField
                            label="Número"
                            placeholder="Ingresar"
                            type="tel"
                            value={creditData.phone}
                            onChange={(e) =>
                                onCreditDataChange("phone", e.target.value)
                            }
                            required
                            error={Boolean(phoneError)}
                            helperText={phoneError}
                            inputProps={{ maxLength: 10 }}
                        />
                    </Grid>
                </Grid>
            </FormCard>
            <FormCard>
                <Typography variant="h6">Cuentas bancarias</Typography>
                <Stack spacing={3} width="100%">
                    {bankAccounts.map((account) => (
                        <DynamicListItem key={account.id}>
                            <Grid container spacing={2} alignItems="flex-end">
                                <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                    <FormTextField
                                        label="Banco"
                                        placeholder="Ingresar"
                                        value={account.bank}
                                        onChange={(e) =>
                                            onBankAccountChange(
                                                account.id,
                                                "bank",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                    <FormTextField
                                        label="Plaza"
                                        placeholder="Ingresar"
                                        value={account.city}
                                        onChange={(e) =>
                                            onBankAccountChange(
                                                account.id,
                                                "city",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                    <FormTextField
                                        label="Sucursal"
                                        placeholder="Ingresar"
                                        value={account.branch}
                                        onChange={(e) =>
                                            onBankAccountChange(
                                                account.id,
                                                "branch",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                    <FormTextField
                                        label="Cuenta"
                                        placeholder="Ingresar"
                                        value={account.account}
                                        onChange={(e) =>
                                            onBankAccountChange(
                                                account.id,
                                                "account",
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid sx={{ display: { xs: "none", sm: "block" } }}>
                                    <DeleteButton
                                        size="small"
                                        onClick={() =>
                                            onRemoveBankAccount(account.id)
                                        }
                                    >
                                        <Trash size={16} />
                                    </DeleteButton>
                                </Grid>
                                <DeleteButtonWrapper>
                                    <DeleteButton
                                        size="small"
                                        onClick={() =>
                                            onRemoveBankAccount(account.id)
                                        }
                                        sx={{ display: { xs: "block", sm: "none" } }}
                                    >
                                        <Trash size={16} />
                                    </DeleteButton>
                                </DeleteButtonWrapper>
                            </Grid>
                        </DynamicListItem>
                    ))}
                </Stack>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onAddBankAccount}
                >
                    Agregar otra
                </Button>
            </FormCard>
        </Stack>
    );
}
