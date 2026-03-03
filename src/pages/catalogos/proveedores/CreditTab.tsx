import { Button, Grid, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import {
    FormCard,
    DynamicListItem,
    DeleteButton,
    DeleteButtonWrapper
} from "@/styles/catalogos/proveedores.styles";
import type { BankAccount, CreditData } from "./types";
import { Trash } from "lucide-react";

export interface CreditTabProps {
    creditData: CreditData;
    bankAccounts: BankAccount[];
    onCreditDataChange: (field: keyof CreditData, value: string) => void;
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
    onCreditDataChange,
    onAddBankAccount,
    onRemoveBankAccount,
    onBankAccountChange,
}: CreditTabProps) {
    return (
        <>
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
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormTextField
                            label="Puesto"
                            placeholder="Ingresar"
                            value={creditData.position}
                            onChange={(e) =>
                                onCreditDataChange("position", e.target.value)
                            }
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
        </>
    );
}
