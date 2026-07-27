import { Button, Stack, Table, TableBody, TableHead, TableRow, Typography } from "@mui/material";
import numeral from "numeral";
import {
    DashboardContainer,
    DashboardHistoryTableContainer,
    StyledProgressBar,
    ViewAllLink,
    TableCell,
    TableHeaderCell,
} from "@/styles/cajas.styles";

import type { CashRegisterDashboardProps } from "./types";
import { CashRegisterSearchBar } from "./CashRegisterSearchBar";
import { MovementTypeCell } from "./MovementTypeCell";
import { PaymentFormCell } from "./PaymentFormCell";
import { formatDate } from "@/utils/date";

const DASHBOARD_MOVEMENTS_LIMIT = 5;

export function CashRegisterDashboard({
    cashRegister,
    searchQuery,
    onSearchQueryChange,
    onSearch,
    isSearching = false,
    canCut = true,
    canWithdraw = true,
    onCut,
    onWithdrawal,
    onViewAllHistory,
    movements = [],
    mode,
    onModeChange,
}: CashRegisterDashboardProps) {
    const progressPercentage = (cashRegister.currentCash / cashRegister.limit) * 100;
    const visibleMovements = movements.slice(0, DASHBOARD_MOVEMENTS_LIMIT);
    const shouldFadeHistory = movements.length > 1;

    return (
        <DashboardContainer>
            <CashRegisterSearchBar
                searchQuery={searchQuery}
                isSearching={isSearching}
                onSearchQueryChange={onSearchQueryChange}
                onSearch={onSearch}
                mode={mode}
                onModeChange={onModeChange}
            />

            <Stack spacing={0.4}>
                <StyledProgressBar variant="determinate" value={progressPercentage} />
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{numeral(cashRegister.currentCash).format("$0,0.00")}</Typography>
                    <Typography variant="body2" color="text.secondary">{numeral(cashRegister.limit).format("$0,0.00")}</Typography>
                </Stack>
            </Stack>

            {
                (canCut || canWithdraw) && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
                        {
                            canCut &&
                            <Button
                                variant="option"
                                color="inherit"
                                onClick={onCut}
                                sx={{ minWidth: { xs: "100%", sm: "144px" } }}>
                                Realizar corte
                            </Button>
                        }
                        {
                            canWithdraw &&
                            <Button
                                variant="option"
                                color="inherit"
                                onClick={onWithdrawal}
                                sx={{ minWidth: { xs: "100%", sm: "144px" } }}>
                                Realizar retiro
                            </Button>
                        }
                    </Stack>
                )
            }

            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Historial de actividad de la caja</Typography>
                <ViewAllLink onClick={onViewAllHistory}>Ver todo</ViewAllLink>
            </Stack>

            <DashboardHistoryTableContainer hasFade={shouldFadeHistory}>
                <Table sx={{ minWidth: "672px" }}>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Hora</TableHeaderCell>
                            <TableHeaderCell>Tipo</TableHeaderCell>
                            <TableHeaderCell>Forma</TableHeaderCell>
                            <TableHeaderCell>Usuario</TableHeaderCell>
                            <TableHeaderCell>Monto</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    {
                        movements.length === 0 ?
                            <Typography variant="body2" color="text.secondary">Sin actividad aún</Typography>
                            :
                            <TableBody>
                                {
                                    visibleMovements.map((movement) => (
                                        <TableRow key={movement.id}>
                                            <TableCell>{formatDate(movement.created_at, "HH:mm")}</TableCell>
                                            <TableCell>
                                                <MovementTypeCell type={movement.movement_type} />
                                            </TableCell>
                                            <TableCell>
                                                <PaymentFormCell paymentForm={movement.payment_form} />
                                            </TableCell>
                                            <TableCell>{movement.created_by_name}</TableCell>
                                            <TableCell>${numeral(movement.amount).format("0,0.00")}</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                    }

                </Table>
            </DashboardHistoryTableContainer>
        </DashboardContainer>
    );
}
