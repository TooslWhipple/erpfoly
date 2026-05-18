import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Plus, Minus } from "lucide-react";
import { MainLayout, Title, TableCrud } from "@/components";
import { AddArticlesToTransferModal } from "./AddArticlesToTransferModal";
import type { Column } from "@/components/TableCrud";
import type { TransferArticleRow, TransferArticleOption } from "@/types/transpasos.types";
import { getArticlesForNewTransfer } from "@/data/transpasos.mockData";
import { QuantityControls, QuantityButton, QuantityValue } from "@/styles/inventario/transpasos.styles";
import { INVENTORY_TRANSFERS_CREATE } from "@/lib/permissions";

export default function TranspasosPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TransferArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArticlesForNewTransfer();
      setRows(
        data.map((a) => ({
          ...a,
          transferQuantity: 1,
        }))
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleQuantityChange = useCallback((id: string, delta: number) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = row.transferQuantity + delta;
        const value = Math.max(0, Math.min(row.inStock, next));
        return { ...row, transferQuantity: value };
      })
    );
  }, []);

  const handleAddArticles = useCallback((articlesToAdd: TransferArticleOption[]) => {
    if (articlesToAdd.length === 0) return;
    setRows((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const newRows: TransferArticleRow[] = articlesToAdd
        .filter((a) => !existingIds.has(a.id))
        .map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          status: "active" as const,
          department: "-",
          line: "-",
          inStock: a.inStock,
          inTransit: a.inTransit,
          transferQuantity: 1,
        }));
      if (newRows.length === 0) return prev;
      return [...prev, ...newRows];
    });
  },
    []
  );

  const handleCreateTransfer = async () => {
    const items = rows.filter((r) => r.transferQuantity > 0);
    if (items.length === 0) return;
    setCreating(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      router.push("/inventario/transpasos");
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<TransferArticleRow>[] = [
    { id: "code", label: "Código", size: "md" },
    {
      id: "status",
      label: "Estatus",
      type: "chip",
      chipColor: "success",
      chipLabelMap: { active: "Activo", inactive: "Inactivo" },
      chipVariantMap: { active: "success", inactive: "default" },
      size: "sm",
    },
    {
      id: "name",
      label: "Nombre",
      size: "xl",
      truncate: true,
    },
    { id: "department", label: "Departamento", size: "md", truncate: true },
    { id: "line", label: "Línea", size: "md" },
    {
      id: "inStock",
      label: "En existencia",
      type: "chip",
      chipColor: "success",
      size: "sm",
    },
    {
      id: "transferQuantity",
      label: "Traspaso",
      size: "sm",
      align: "center",
      format: (value, row) => (
        <QuantityControls>
          <QuantityButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(row.id, -1);
            }}
            disabled={row.transferQuantity <= 0}
            aria-label="Decrease quantity"
          >
            <Minus size={18} />
          </QuantityButton>
          <QuantityValue>{row.transferQuantity}</QuantityValue>
          <QuantityButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(row.id, 1);
            }}
            disabled={row.transferQuantity >= row.inStock}
            aria-label="Increase quantity"
          >
            <Plus size={18} />
          </QuantityButton>
        </QuantityControls>
      ),
    },
  ];

  const existingIds = rows.map((r) => r.id);
  const breadcrumbItems = [
    { label: "Inventario", href: "/inventario" },
    { label: "Traspasos", href: "/inventario/transpasos" },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Title
          title="Nuevo traspaso"
          actions={[
            {
              id: "create",
              label: "Crear transpaso",
              onClick: () => setAddModalOpen(true),
              icon: <Plus size={18} />,
              permission: INVENTORY_TRANSFERS_CREATE,
            },
          ]}
        />


        <TableCrud<TransferArticleRow>
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey="id"
          emptyMessage="No hay artículos. Usa «Agregar artículos» para agregar artículos a este traspaso."
        />
      </Stack>

      <AddArticlesToTransferModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        existingArticleIds={existingIds}
        onConfirm={handleAddArticles}
      />
    </MainLayout>
  );
}
