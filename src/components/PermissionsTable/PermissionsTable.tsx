import {
    TableBody,
} from "@mui/material";
import {
    CheckboxWrapper,
    ModuleCell,
    PermissionCell,
    PermissionLabel,
    StyledCheckbox,
    StyledTable,
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
    disabled?: boolean;
}

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
