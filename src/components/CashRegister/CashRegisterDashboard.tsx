import { Button, InputAdornment, Stack, Typography } from "@mui/material";
import { KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import numeral from "numeral";
import {
    DashboardContainer,
    SearchBarContainer,
    PaymentTypeSelect,
    SearchInput,
    SearchButton,
    ProgressBarLabel,
    StyledProgressBar,
    ViewAllLink,
    HistoryTable,
    HistoryTableHeader,
    HistoryTableHeaderCell,
    EmptyHistoryMessage,
} from "@/styles/cajas.styles";

import type { CashRegisterDashboardProps } from "./types";
import { Search } from "lucide-react";
import { theme } from "@/styles/theme";

export function CashRegisterDashboard({
    cashRegister,
    searchQuery,
    onSearchQueryChange,
    canCut = true,
    canWithdraw = true,
    onCut,
    onWithdrawal,
    onViewAllHistory,
}: CashRegisterDashboardProps) {
    const progressPercentage = (cashRegister.currentCash / cashRegister.limit) * 100;

    return (
        <DashboardContainer>
            <SearchBarContainer>
                <PaymentTypeSelect variant="outlined" endIcon={<KeyboardArrowDownIcon />}>
                    Abonos
                </PaymentTypeSelect>

                <SearchInput
                    placeholder="Ingresa código o nombre del cliente"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} color={theme.palette.text.secondary} />
                            </InputAdornment>
                        ),
                    }}
                />

                <SearchButton
                    variant="contained"
                    onClick={() => { }}>
                    Buscar
                </SearchButton>
            </SearchBarContainer>

            <Stack spacing={0.4}>
                <StyledProgressBar variant="determinate" value={progressPercentage} />
                <Stack direction="row" justifyContent="space-between">
                    <ProgressBarLabel>{numeral(cashRegister.currentCash).format("$0,0.00")}</ProgressBarLabel>
                    <ProgressBarLabel>{numeral(cashRegister.limit).format("$0,0.00")}</ProgressBarLabel>
                </Stack>
            </Stack>

            {
                (canCut || canWithdraw) && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
                        {
                            canCut && (
                                <Button
                                    variant="option"
                                    onClick={onCut}
                                    style={{ width: "144px" }}>
                                    Realizar corte
                                </Button>
                            )
                        }
                        {
                            canWithdraw && (
                                <Button
                                    variant="option"
                                    onClick={onWithdrawal}
                                    style={{ width: "144px" }}>
                                    Realizar retiro
                                </Button>
                            )
                        }
                    </Stack>
                )
            }

            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Historial de actividad de la caja</Typography>
                <ViewAllLink onClick={onViewAllHistory}>Ver todo</ViewAllLink>
            </Stack>

            <HistoryTable>
                <HistoryTableHeader>
                    <HistoryTableHeaderCell>Hora</HistoryTableHeaderCell>
                    <HistoryTableHeaderCell>Tipo</HistoryTableHeaderCell>
                    <HistoryTableHeaderCell>Forma</HistoryTableHeaderCell>
                    <HistoryTableHeaderCell>Usuario</HistoryTableHeaderCell>
                    <HistoryTableHeaderCell>Monto</HistoryTableHeaderCell>
                </HistoryTableHeader>

                <EmptyHistoryMessage>Sin actividad aún</EmptyHistoryMessage>
            </HistoryTable>
        </DashboardContainer>
    );
}
