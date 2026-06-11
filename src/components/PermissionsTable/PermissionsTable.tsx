import { TableBody, Typography } from "@mui/material";
import {
    CheckboxWrapper,
    HeaderModuleCell,
    HeaderPermissionCell,
    HeaderRow,
    ModuleCell,
    PermissionCell,
    PermissionLabel,
    StyledCheckbox,
    StyledTable,
    StyledTableHead,
    StyledTableRow,
    TableContainer,
} from "./PermissionsTable.styles";

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
    onGroupChange?: (permission: keyof Permission, value: boolean) => void;
    groupState?: Partial<
        Record<
            keyof Permission,
            {
                checked: boolean;
                indeterminate: boolean;
            }
        >
    >;
    disabled?: boolean;
}

export function PermissionsTable({
    modules,
    onChange,
    onGroupChange,
    groupState,
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
                <StyledTableHead>
                    <HeaderRow>
                        <HeaderModuleCell>Módulo</HeaderModuleCell>
                        {
                            permissionColumns.map((col) => {
                                const state = groupState?.[col.key];
                                return (
                                    <HeaderPermissionCell key={col.key}>
                                        <CheckboxWrapper>
                                            <StyledCheckbox
                                                checked={Boolean(state?.checked)}
                                                indeterminate={Boolean(state?.indeterminate)}
                                                onChange={(e) =>
                                                    onGroupChange?.(
                                                        col.key,
                                                        e.target.checked,
                                                    )
                                                }
                                                disabled={
                                                    disabled ||
                                                    modules.length === 0 ||
                                                    !onGroupChange
                                                }
                                                size="small"
                                            />
                                            <PermissionLabel>{col.label}</PermissionLabel>
                                        </CheckboxWrapper>
                                    </HeaderPermissionCell>
                                );
                            })
                        }
                    </HeaderRow>
                </StyledTableHead>
                <TableBody>
                    {
                        modules.map((module) => (
                            <StyledTableRow key={module.id}>
                                <ModuleCell>{module.name}</ModuleCell>
                                {
                                    permissionColumns.map((col) => (
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
                                                <Typography variant="body1" fontWeight={500} color={(module.permissions[col.key] ? 'primary.main' : 'text.main')}>{col.label}</Typography>
                                            </CheckboxWrapper>
                                        </PermissionCell>
                                    ))
                                }
                            </StyledTableRow>
                        ))
                    }
                </TableBody>
            </StyledTable>
        </TableContainer>
    );
}
