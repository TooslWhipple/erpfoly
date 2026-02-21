import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Stack } from "@mui/material";
import {
  MainLayout,
  Breadcrumbs,
  TableCrud,
  Title,
} from "@/components";
import type { Column } from "@/components/TableCrud";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { getDepartmentById } from "@/services/departments.service";
import { getProductLines, type ProductLineItem } from "@/services/product-lines.service";
import type { Department } from "@/services/departments.service";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const departmentId = id === "new" || id === "nuevo" ? null : Number(id);

  const [department, setDepartment] = useState<Department | null>(null);
  const [productLines, setProductLines] = useState<ProductLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLines, setLoadingLines] = useState(true);

  const fetchDepartment = useCallback(async () => {
    if (departmentId == null || Number.isNaN(departmentId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getDepartmentById(departmentId);
      setDepartment(data);
    } catch (err) {
      console.error("[DepartmentDetail] Error fetching department:", err);
      setDepartment(null);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  const fetchProductLines = useCallback(async () => {
    if (departmentId == null || Number.isNaN(departmentId)) {
      setLoadingLines(false);
      return;
    }

    setLoadingLines(true);
    try {
      const res = await getProductLines({ departmentId });
      setProductLines(res.data);
    } catch (err) {
      console.error("[DepartmentDetail] Error fetching product lines:", err);
      setProductLines([]);
    } finally {
      setLoadingLines(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  useEffect(() => {
    fetchProductLines();
  }, [fetchProductLines]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Departamentos", href: "/catalogos/departamentos" },
    { label: department ? department.name : "Detalle" },
  ];

  const lineColumns: Column<ProductLineItem>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "Nombre",
      size: "md",
    },
    {
      id: "code",
      label: "Código",
      size: "sm",
    },
  ];

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

  if (!department) {
    return (
      <MainLayout>
        <Stack spacing={2}>
          <Breadcrumbs items={breadcrumbItems} />
          <Box sx={{ py: 2 }}>Departamento no encontrado.</Box>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Breadcrumbs items={breadcrumbItems} />
        <Title title={department.name} />
        <TableCrud
          columns={lineColumns}
          rows={productLines}
          rowKey="id"
          loading={loadingLines}
          emptyMessage="No hay líneas en este departamento"
        />
      </Stack>
    </MainLayout>
  );
}
