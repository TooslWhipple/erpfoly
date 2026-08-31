import { Alert, Button, Stack, Table, TableBody, TableHead, TableRow, Typography } from "@mui/material";
import numeral from "numeral";
import { AlertTriangle } from "lucide-react";
import {
    AdminActionsRow,
    DashboardSplit,
    DashboardColumn,
    DashboardPanel,
    DashboardHistoryTableContainer,
    StyledProgressBar,
    ViewAllLink,
    TableCell,
    TableHeaderCell,
} from "@/styles/cajas.styles";

import type { CashRegisterDashboardProps } from "./types";
import { CashRegisterSearchBar } from "./CashRegisterSearchBar";
import { PendingCollectionsPanel } from "./PendingCollectionsPanel";
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
    pendingSales = [],
    pendingLoading = false,
    onProcessSale,
    cashLimitLevel,
    cashLimitProgress,
}: CashRegisterDashboardProps) {
    const visibleMovements = movements.slice(0, DASHBOARD_MOVEMENTS_LIMIT);
    const shouldFadeHistory = movements.length > 1;
    const isLimitExceeded = cashLimitLevel === "exceeded";

    return (
        <DashboardSplit>
            <DashboardColumn>
                <CashRegisterSearchBar
                    searchQuery={searchQuery}
                    isSearching={isSearching}
                    onSearchQueryChange={onSearchQueryChange}
                    onSearch={onSearch}
                    mode={mode}
                    onModeChange={onModeChange}
                />

                <Stack spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Cobros Pendientes
                    </Typography>
                    <PendingCollectionsPanel
                        rows={pendingSales}
                        loading={pendingLoading}
                        onProcess={onProcessSale}
                    />
                </Stack>
            </DashboardColumn>

            <DashboardColumn>
                <DashboardPanel>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Efectivo en caja
                    </Typography>
                    <Stack spacing={0.4}>
                        <StyledProgressBar
                            variant="determinate"
                            value={cashLimitProgress}
                            level={cashLimitLevel}
                        />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                {numeral(cashRegister.currentCash).format("$0,0.00")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {numeral(cashRegister.limit).format("$0,0.00")}
                            </Typography>
                        </Stack>
                    </Stack>
                    {isLimitExceeded && (
                        <Alert
                            severity="error"
                            icon={<AlertTriangle size={18} />}
                        >
                            Límite de efectivo excedido. Se sugiere realizar un retiro.
                        </Alert>
                    )}
                </DashboardPanel>

                {(canCut || canWithdraw) && (
                    <DashboardPanel>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Acciones administrativas
                        </Typography>
                        <AdminActionsRow>
                            {canWithdraw && (
                                <Button
                                    variant="option"
                                    color="inherit"
                                    onClick={onWithdrawal}
                                >
                                    Realizar retiro
                                </Button>
                            )}
                            {canCut && (
                                <Button
                                    variant="option"
                                    color="inherit"
                                    onClick={onCut}
                                >
                                    Realizar corte
                                </Button>
                            )}
                        </AdminActionsRow>
                    </DashboardPanel>
                )}

                <DashboardPanel>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                        minWidth={0}
                    >
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                            Historial de actividad (Hoy)
                        </Typography>
                        <ViewAllLink onClick={onViewAllHistory} sx={{ flexShrink: 0 }}>
                            Ver todo
                        </ViewAllLink>
                    </Stack>

                    <DashboardHistoryTableContainer hasFade={shouldFadeHistory}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Hora</TableHeaderCell>
                                    <TableHeaderCell>Tipo</TableHeaderCell>
                                    <TableHeaderCell>Forma</TableHeaderCell>
                                    <TableHeaderCell>Usuario</TableHeaderCell>
                                    <TableHeaderCell>Monto</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            {movements.length === 0 ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sin actividad aún
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <TableBody>
                                    {visibleMovements.map((movement) => (
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
                                    ))}
                                </TableBody>
                            )}
                        </Table>
                    </DashboardHistoryTableContainer>
                </DashboardPanel>
            </DashboardColumn>
        </DashboardSplit>
    );
}
