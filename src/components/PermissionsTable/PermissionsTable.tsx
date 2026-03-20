import { styled } from "@mui/material/styles";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    Typography,
} from "@mui/material";
import { colors } from "@/styles/theme";

export interface Permission {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface ModulePermission {
    id: string;
    name: string;
    permissions: Permission;
}

export interface PermissionsTableProps {
    modules: ModulePermission[];
    onChange: (moduleId: string, permission: keyof Permission, value: boolean) => void;
    disabled?: boolean;
}

const TableContainer = styled(Box)({
    width: "100%",
    overflowX: "auto",
});

const StyledTable = styled(Table)({
    width: "100%",
    borderCollapse: "collapse",
});

const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: colors.background.main,
    },
});

const ModuleCell = styled(TableCell)({
    borderBottom: `1px solid ${colors.border}`,
    padding: "12px 16px",
    fontSize: "0.875rem",
    color: "#232325",
    width: "40%",
});

const PermissionCell = styled(TableCell)({
    borderBottom: `1px solid ${colors.border}`,
    padding: "8px 16px",
    textAlign: "center",
    width: "15%",
});

const CheckboxWrapper = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
});

const PermissionLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.primary.main,
    fontWeight: 500,
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: 4,
    "&.Mui-checked": {
        color: theme.palette.primary.main,
    },
}));

export function PermissionsTable({
    modules,
    onChange,
    disabled = false,
}: PermissionsTableProps) {
    const permissionColumns: { key: keyof Permission; label: string }[] = [
        { key: "view", label: "Visualizar" },
        { key: "create", label: "Crear" },
        { key: "edit", label: "Editar" },
        { key: "delete", label: "Borrar" },
    ];

    return (
        <TableContainer>
            <StyledTable>
                <TableBody>
                    {modules.map((module) => (
                        <StyledTableRow key={module.id}>
                            <ModuleCell>{module.name}</ModuleCell>
                            {permissionColumns.map((col) => (
                                <PermissionCell key={col.key}>
                                    <CheckboxWrapper>
                                        <StyledCheckbox
                                            checked={module.permissions[col.key]}
                                            onChange={(e) =>
                                                onChange(module.id, col.key, e.target.checked)
                                            }
                                            disabled={disabled}
                                            size="small"
                                        />
                                        <PermissionLabel>{col.label}</PermissionLabel>
                                    </CheckboxWrapper>
                                </PermissionCell>
                            ))}
                        </StyledTableRow>
                    ))}
                </TableBody>
            </StyledTable>
        </TableContainer>
    );
}
