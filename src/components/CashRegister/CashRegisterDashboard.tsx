import { Grid, InputAdornment } from "@mui/material";
import { Search as SearchIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import {
    DashboardContainer,
    SearchBarContainer,
    PaymentTypeSelect,
    SearchInput,
    SearchButton,
    BalanceCard,
    ProgressBarContainer,
    ProgressBarLabels,
    ProgressBarLabel,
    StyledProgressBar,
    BalanceInfoContainer,
    BalanceInfoItem,
    BalanceLabel,
    BalanceValue,
    ActionsContainer,
    ActionButton,
    HistorySection,
    HistoryHeader,
    HistoryTitle,
    ViewAllLink,
    HistoryTable,
    HistoryTableHeader,
    HistoryTableHeaderCell,
    EmptyHistoryMessage,
} from "@/styles/cajas.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import type { CashRegisterDashboardProps } from "./types";

// ============================================================================
// COMPONENT
// ============================================================================

export function CashRegisterDashboard({
    cashRegister,
    searchQuery,
    onSearchQueryChange,
    onCut,
    onWithdrawal,
    onViewAllHistory,
}: CashRegisterDashboardProps) {
    const remainingLimit = cashRegister.limit - cashRegister.currentCash;
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
                                <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <SearchButton variant="contained" onClick={() => { }}>
                    Buscar
                </SearchButton>
            </SearchBarContainer>

            <BalanceCard>
                <ProgressBarContainer>
                    <ProgressBarLabels>
                        <ProgressBarLabel>$0</ProgressBarLabel>
                        <ProgressBarLabel>
                            ${cashRegister.limit.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </ProgressBarLabel>
                    </ProgressBarLabels>
                    <StyledProgressBar variant="determinate" value={progressPercentage} />
                </ProgressBarContainer>

                <Grid container spacing={2} justifyContent='space-between'>
                    <Grid>
                        <BalanceLabel>Efectivo actual</BalanceLabel>
                        <BalanceValue>
                            ${cashRegister.currentCash.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </BalanceValue>
                    </Grid>

                    <Grid>
                        <BalanceLabel>Límite restante</BalanceLabel>
                        <BalanceValue sx={{ textAlign: 'right' }}>
                            ${remainingLimit.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </BalanceValue>
                    </Grid>
                </Grid>
            </BalanceCard>

            <ActionsContainer>
                <ActionButton variant="outlined" onClick={onCut}>
                    Realizar corte
                </ActionButton>
                <ActionButton variant="outlined" onClick={onWithdrawal}>
                    Realizar retiro
                </ActionButton>
            </ActionsContainer>

            <HistorySection>
                <HistoryHeader>
                    <HistoryTitle>Historial de actividad de la caja</HistoryTitle>
                    <ViewAllLink onClick={onViewAllHistory}>Ver todo</ViewAllLink>
                </HistoryHeader>

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
            </HistorySection>
        </DashboardContainer>
    );
}
