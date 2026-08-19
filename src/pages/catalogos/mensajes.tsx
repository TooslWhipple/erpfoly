import { useState, useEffect, useMemo, useRef } from "react";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import { Title, TableCrud, TabFilters } from "@/components";
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
  getCollectionMessageById,
  getCollectionMessageVariables,
  createCollectionMessage,
  updateCollectionMessage,
  deleteCollectionMessage,
} from "@/services/collection-messages.service";
import type {
  CollectionMessage,
  MessageChannel,
} from "@/services/collection-messages.service";
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
  subject: string | null;
  channel: MessageChannel;
  status: "active" | "inactive";
  inUse: boolean;
}

function apiToMessage(row: CollectionMessage): Message {
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    subject: row.subject,
    channel: row.channel,
    status: row.status === "ACTIVE" ? "active" : "inactive",
    inUse: row.inUse,
  };
}

const CHANNEL_LABEL: Record<MessageChannel, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Correo",
};

const SEARCH_DEBOUNCE_MS = 300;

export default function Mensajes() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const openedDeepLinkRef = useRef<number | null>(null);

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

  const [messageVariables, setMessageVariables] = useState<MessageVariableItem[]>(
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getCollectionMessageVariables();
      if (cancelled || result.error || !result.data) return;
      setMessageVariables(
        result.data.map((row) => ({
          key: row.code,
          label: row.label,
          value: row.token,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const messages = useMemo(
    () => (apiMessages ?? []).map(apiToMessage),
    [apiMessages],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const raw = router.query.messageId;
    const messageId =
      typeof raw === "string"
        ? Number(raw)
        : Array.isArray(raw)
          ? Number(raw[0])
          : NaN;

    if (!Number.isFinite(messageId) || messageId <= 0) {
      openedDeepLinkRef.current = null;
      return;
    }
    if (openedDeepLinkRef.current === messageId) return;
    openedDeepLinkRef.current = messageId;

    let cancelled = false;
    void (async () => {
      const result = await getCollectionMessageById(messageId);
      if (cancelled) return;

      if (result.error || !result.data) {
        showError(
          result.error?.message ?? "No se pudo abrir el mensaje solicitado.",
        );
      } else {
        setEditingMessage(apiToMessage(result.data));
        setModalOpen(true);
      }

      const nextQuery = { ...router.query };
      delete nextQuery.messageId;
      void router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        { shallow: true },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.messageId, router, showError]);

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
          channel: data.channel,
          subject: data.subject,
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
          channel: data.channel,
          subject: data.subject,
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
      id: "channel",
      label: "Canal",
      size: "sm",
      format: (value) => CHANNEL_LABEL[value as MessageChannel] ?? String(value),
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
    <>
      <Stack direction="column" spacing={3}>
        <Title title="Mensajes" />
        <TabFilters
          tabs={[]}
          activeTab=""
          onTabChange={() => {}}
          showSearch
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained",
              color: "primary",
              permission: CATALOG_MESSAGES_CREATE,
            },
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
        messageVariables={messageVariables}
        initialValues={
          editingMessage
            ? {
                name: editingMessage.name,
                content: editingMessage.content,
                channel: editingMessage.channel,
                subject: editingMessage.subject ?? undefined,
                status: editingMessage.status,
              }
            : undefined
        }
        inUse={editingMessage ? editingMessage.inUse : undefined}
        loading={saving}
      />
    </>
  );
}
