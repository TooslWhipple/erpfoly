import { useState, useEffect, useMemo } from "react";
import { Stack } from "@mui/material";
import { MainLayout, Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";

import {
  MessageFormModal,
  type MessageFormData,
  type MessageVariableItem,
} from "@/components/Messages";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getCollectionMessages,
  createCollectionMessage,
  updateCollectionMessage,
  deleteCollectionMessage,
} from "@/services/collection-messages.service";
import type { CollectionMessage } from "@/services/collection-messages.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  CATALOG_MESSAGES_CREATE,
  CATALOG_MESSAGES_DELETE,
  CATALOG_MESSAGES_UPDATE,
} from "@/lib/permissions";

interface Message {
  id: number;
  name: string;
  content: string;
  status: "active" | "inactive";
  inUse: boolean;
}

function apiToMessage(row: CollectionMessage): Message {
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    status: row.status === "ACTIVE" ? "active" : "inactive",
    inUse: row.inUse,
  };
}

const MESSAGE_VARIABLES_CATALOG: MessageVariableItem[] = [
  { key: "fecha_limite", label: "Fecha límite", value: "*fecha_limite*" },
  { key: "num_factura", label: "Número de factura", value: "*num_factura*" },
  {
    key: "descripcion_factura",
    label: "Descripción de factura",
    value: "*descripcion_factura*",
  },
  { key: "total_adeudo", label: "Total adeudo", value: "*total_adeudo*" },
  { key: "proximo_pag", label: "Próximo pago", value: "*proximo_pag*" },
];

const SEARCH_DEBOUNCE_MS = 300;

export default function Mensajes() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const {
    data: apiMessages,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<CollectionMessage>({
    queryKey: ["collection-messages"],
    queryFn: getCollectionMessages,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const messages = useMemo(() => (apiMessages ?? []).map(apiToMessage), [apiMessages]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleOpenCreateModal = () => {
    setEditingMessage(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (message: Message) => {
    setEditingMessage(message);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMessage(null);
  };

  const handleSaveMessage = async (data: MessageFormData) => {
    setSaving(true);
    try {
      const status = data.status === "active" ? "ACTIVE" : "INACTIVE";
      if (editingMessage) {
        const result = await updateCollectionMessage(editingMessage.id, {
          name: data.name,
          content: data.content,
          status,
        });
        if (result.error) {
          showError(result.error.message);
          return;
        }
        showSuccess("Mensaje actualizado correctamente");
      } else {
        const result = await createCollectionMessage({
          name: data.name,
          content: data.content,
          status,
        });
        if (result.error) {
          showError(result.error.message);
          return;
        }
        showSuccess("Mensaje creado correctamente");
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    if (message.inUse) {
      showError(
        "No se puede eliminar el mensaje porque está en uso en una o más cobranzas automáticas.",
      );
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el mensaje "${message.name}"?`,
    );
    if (!confirmed) return;

    try {
      const result = await deleteCollectionMessage(message.id);
      if (result.error) {
        showError(result.error.message);
        return;
      }
      showSuccess("Mensaje eliminado correctamente");
      refetch();
    } catch {
      showError("Error al eliminar el mensaje");
    }
  };

  const columns: Column<Message>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      maxSize: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "Nombre",
      size: "lg",
      truncate: true,
    },
    {
      id: "content",
      label: "Mensaje",
      size: "xl",
      truncate: true,
    },
    {
      id: "inUse",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: { true: "En uso", false: "Sin uso" },
      chipVariantMap: { true: "success", false: "default" } as Record<
        string,
        StatusChipVariant
      >,
    },
  ];

  const actions: RowAction<Message>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
      permission: CATALOG_MESSAGES_UPDATE,
    },
    {
      id: "delete",
      label: "Eliminar",
      onClick: handleDeleteMessage,
      color: "error",
      disabled: (row) => row.inUse,
      permission: CATALOG_MESSAGES_DELETE,
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Mensajes" />
        <TabFilters
          tabs={[]}
          activeTab=""
          onTabChange={() => { }}
          showSearch
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar"
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained",
              color: "primary",
              permission: CATALOG_MESSAGES_CREATE,
            }
          ]}
        />

        <TableCrud
          columns={columns}
          rows={messages}
          actions={actions}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowClick={handleOpenEditModal}
          emptyMessage="No hay mensajes registrados"
        />
      </Stack>

      <MessageFormModal
        key={modalOpen ? (editingMessage?.id ?? "new") : "closed"}
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSaveMessage}
        messageVariables={MESSAGE_VARIABLES_CATALOG}
        initialValues={
          editingMessage
            ? {
              name: editingMessage.name,
              content: editingMessage.content,
              status: editingMessage.status,
            }
            : undefined
        }
        inUse={editingMessage ? editingMessage.inUse : undefined}
        loading={saving}
      />
    </MainLayout>
  );
}
