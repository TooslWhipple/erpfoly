import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Alert, Stack } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  MainLayout,
  Breadcrumbs,
  ModalForm,
  TableCrud,
  Title,
} from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { FormFieldConfig } from "@/components/Form";
import {
  getDepartmentById,
  updateDepartment,
  type Department,
  type ProductGroup,
} from "@/pages/catalogos/departamentos";

// ============================================================================
// TYPES - Group row for TableCrud (with mock articles count)
// ============================================================================

interface GroupRow extends ProductGroup {
  articles: number;
}

// ============================================================================
// MOCK - affected items count for promotion (matches list page logic)
// ============================================================================

async function getAffectedItemsCount(departmentId?: number): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (departmentId === 1) return 43;
  if (departmentId === 2) return 28;
  return Math.floor(Math.random() * 50) + 10;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const departmentId = id === "new" || id === "nuevo" ? null : Number(id);

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [savingGroup, setSavingGroup] = useState(false);
  const [hasGroupPromotion, setHasGroupPromotion] = useState(false);
  const [groupAffectedCount, setGroupAffectedCount] = useState<number | null>(null);
  const [groupFormValues, setGroupFormValues] = useState<Record<string, unknown>>({});

  const fetchDepartment = useCallback(async () => {
    if (departmentId == null || Number.isNaN(departmentId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getDepartmentById(departmentId);
      if (data) {
        setDepartment(data);
      } else {
        setDepartment(null);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  useEffect(() => {
    if (hasGroupPromotion && groupModalOpen && department) {
      getAffectedItemsCount(department.id).then(setGroupAffectedCount);
    } else {
      setGroupAffectedCount(null);
    }
  }, [hasGroupPromotion, groupModalOpen, department]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Departamentos", href: "/catalogos/departamentos" },
    { label: department ? department.name : "Detalle" },
  ];

  const handleOpenNewGroup = () => {
    setEditingGroup(null);
    setHasGroupPromotion(false);
    setGroupFormValues({});
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (row: GroupRow) => {
    setEditingGroup(row);
    setHasGroupPromotion(Boolean(row.promotion));
    setGroupFormValues({
      id: row.id,
      name: row.name,
      hasGroupPromotion: Boolean(row.promotion),
      promotionPercentage: row.promotion?.percentage,
      promotionStartDate: row.promotion?.startDate,
      promotionEndDate: row.promotion?.endDate,
    });
    setGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    setEditingGroup(null);
    setHasGroupPromotion(false);
    setGroupAffectedCount(null);
    setGroupFormValues({});
  };

  const handleGroupFormValuesChange = useCallback((values: Record<string, unknown>) => {
    setGroupFormValues(values);
    setHasGroupPromotion(Boolean(values.hasGroupPromotion));
  }, []);

  const handleSaveGroup = async (data: Record<string, unknown>) => {
    if (!department) return;
    setSavingGroup(true);
    try {
      const groupName = (data.name as string).trim();
      const promotion =
        data.hasGroupPromotion &&
          data.promotionPercentage != null &&
          data.promotionStartDate &&
          data.promotionEndDate
          ? {
            percentage: Number(data.promotionPercentage),
            startDate: data.promotionStartDate as string,
            endDate: data.promotionEndDate as string,
          }
          : undefined;

      let newGroups: ProductGroup[];

      if (editingGroup) {
        newGroups = department.groups.map((g) =>
          g.id === editingGroup.id
            ? { id: editingGroup.id, name: groupName, ...(promotion && { promotion }) }
            : g
        );
      } else {
        const groupId = (data.id as string).trim().toUpperCase();
        newGroups = [
          ...department.groups,
          { id: groupId, name: groupName, ...(promotion && { promotion }) },
        ];
      }

      const updated = await updateDepartment(department.id, {
        name: department.name,
        margin: department.margin,
        groups: newGroups,
        ...(department.promotion && { promotion: department.promotion }),
      });
      
      setDepartment(updated);
      handleCloseGroupModal();
    } catch (err) {
      console.error("[DepartmentDetail] Error saving group:", err);
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (row: GroupRow) => {
    if (!department) return;
    const confirmed = window.confirm(
      `¿Eliminar el grupo "${row.name}"?`
    );
    if (!confirmed) return;

    try {
      const newGroups = department.groups.filter((g) => g.id !== row.id);
      const updated = await updateDepartment(department.id, {
        name: department.name,
        margin: department.margin,
        groups: newGroups,
        ...(department.promotion && { promotion: department.promotion }),
      });
      setDepartment(updated);
    } catch (err) {
      console.error("[DepartmentDetail] Error deleting group:", err);
    }
  };

  const groupRows: GroupRow[] = useMemo(() => {
    if (!department?.groups.length) return [];
    const hash = (s: string) => s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    return department.groups.map((g) => ({
      ...g,
      articles: 10 + Math.abs(hash(g.id)) % 35,
    }));
  }, [department?.groups]);

  const groupColumns: Column<GroupRow>[] = useMemo(
    () => [
      {
        id: "id",
        label: "Identificador",
        type: "text",
        size: "sm",
      },
      {
        id: "name",
        label: "Nombre",
        size: "md",
      },
      {
        id: "articles",
        label: "Artículos",
        type: "number",
        size: "sm",
      }
    ],
    []
  );

  const groupActions: RowAction<GroupRow>[] = [
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleOpenEditGroup,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: handleDeleteGroup,
      color: "error",
    },
  ];

  const groupFormFields: FormFieldConfig[] = useMemo(() => {
    const base: FormFieldConfig[] = [
      {
        name: "id",
        label: "Abreviación",
        type: "text",
        placeholder: "SL",
        validation: { required: true, minLength: 1, maxLength: 10 },
        autoFocus: true,
        disabled: !!editingGroup,
      },
      {
        name: "name",
        label: "Nombre de la categoría",
        type: "text",
        placeholder: "Sillas",
        validation: { required: true, minLength: 2, maxLength: 100 },
      },
      {
        name: "hasGroupPromotion",
        label: "Agregar Promoción para esta Línea",
        type: "switch",
        defaultValue: false,
      },
    ];

    if (hasGroupPromotion) {
      base.push(
        {
          name: "promotionPercentage",
          label: "Promoción",
          type: "number",
          placeholder: "32",
          validation: { required: true, min: 0, max: 100 }
        },
        {
          name: "promotionStartDate",
          label: "Fecha de inicio",
          type: "date",
          validation: { required: true },
        },
        {
          name: "promotionEndDate",
          label: "Fecha fin",
          type: "date",
          validation: {
            required: true,
            custom: (value, allValues) => {
              const start = allValues.promotionStartDate as string | undefined;
              const end = value as string | undefined;
              if (start && end && new Date(end) < new Date(start)) {
                return "La fecha fin debe ser posterior a la fecha de inicio";
              }
              return undefined;
            },
          },
        }
      );
    }
    return base;
  }, [editingGroup, hasGroupPromotion]);

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Breadcrumbs items={breadcrumbItems} />
        <Title
          title={department?.name}
          actions={[
            {
              id: "edit",
              label: "Nuevo grupo",
              icon: <AddIcon />,
              onClick: handleOpenNewGroup
            }
          ]}
        />
        <TableCrud
          columns={groupColumns}
          rows={groupRows}
          actions={groupActions}
          rowKey="id"
          loading={false}
          emptyMessage="No hay grupos en este departamento"
        />
      </Stack>

      <ModalForm
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        title={editingGroup ? "Editar línea" : "Nueva línea"}
        fields={groupFormFields}
        onConfirm={handleSaveGroup}
        loading={savingGroup}
        initialValues={
          Object.keys(groupFormValues).length > 0
            ? groupFormValues
            : editingGroup
              ? {
                id: editingGroup.id,
                name: editingGroup.name,
                hasGroupPromotion: Boolean(editingGroup.promotion),
                promotionPercentage: editingGroup.promotion?.percentage,
                promotionStartDate: editingGroup.promotion?.startDate,
                promotionEndDate: editingGroup.promotion?.endDate,
              }
              : { id: "", name: "", hasGroupPromotion: false }
        }
        confirmLabel={editingGroup ? "Guardar" : "Crear"}
        cancelLabel="Cancelar"
        maxWidth="sm"
        onValuesChange={handleGroupFormValuesChange}
      >
        {hasGroupPromotion && groupAffectedCount !== null && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              {groupAffectedCount} artículos serán afectados con esta promoción.
            </Alert>
          </Box>
        )}
      </ModalForm>
    </MainLayout >
  );
}
