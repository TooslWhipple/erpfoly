import { useState, useEffect, useCallback } from "react";
import { InputAdornment } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import {
    HeaderContainer,
    ControlsContainer,
    SearchInput,
    CreateButton,
    SearchIconStyled,
} from "@/styles/catalogos/catalogos.styledComponents";
import { MessageFormModal, type MessageFormData } from "@/components/Messages";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Message {
    id: number;
    name: string;
    content: string;
    status: "active" | "inactive";
}

interface GetMessagesParams {
    page: number;
    limit: number;
    search?: string;
}

interface GetMessagesResponse {
    data: Message[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// MOCK DATA - Collection messages for payment reminders
// ============================================================================

const DUMMY_MESSAGES: Message[] = [
    {
        id: 1,
        name: "Mensaje recordatorio de pago",
        content: "¡Hola! Te recordamos que la fecha límite de pago es el próximo *fecha_limite*, te invitamos a realizar tu pago antes de esa fecha para evitar recargos.",
        status: "active",
    },
    {
        id: 2,
        name: "Mensaje de invitación de pago",
        content: "¡Hola! Te invitamos a realizar tu pago el día de hoy por cualquiera de nuestros medios de pago disponibles. Recuerda que puedes pagar en sucursal, transferencia o en línea.",
        status: "active",
    },
    {
        id: 3,
        name: "Mensaje advertencia judicial",
        content: "No hemos recibido el pago correspondiente a *factura_descripcion* en la fecha establecida. Te recordamos que el incumplimiento puede derivar en acciones legales.",
        status: "active",
    },
    {
        id: 4,
        name: "Mensaje de invitación de pago",
        content: "¡Hola! Te invitamos a realizar tu pago el día de hoy por cualquiera de nuestros medios de pago. Aprovecha nuestras promociones especiales para clientes puntuales.",
        status: "inactive",
    },
    {
        id: 5,
        name: "Mensaje de agradecimiento",
        content: "¡Gracias por tu pago! Tu cuenta ha sido actualizada correctamente. Te esperamos pronto en nuestras sucursales.",
        status: "active",
    },
    {
        id: 6,
        name: "Mensaje de mora leve",
        content: "Notamos que tu pago tiene algunos días de retraso. Te invitamos a regularizar tu situación lo antes posible para evitar cargos adicionales.",
        status: "inactive",
    },
    {
        id: 7,
        name: "Mensaje promoción pago anticipado",
        content: "¡Aprovecha! Si realizas tu pago antes del *fecha_limite* obtienes un descuento especial del 5% en tu próxima compra.",
        status: "active",
    },
    {
        id: 8,
        name: "Mensaje recordatorio semanal",
        content: "Esta es tu recordatorio semanal: Tu próximo pago vence el *fecha_limite*. Monto pendiente: *monto_pendiente*.",
        status: "active",
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getMessages(params: GetMessagesParams): Promise<GetMessagesResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_MESSAGES];

    // Filter by search
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (m) =>
                m.name.toLowerCase().includes(searchLower) ||
                m.content.toLowerCase().includes(searchLower)
        );
    }

    const total = filteredData.length;
    const start = params.page * params.limit;
    const end = start + params.limit;
    const paginatedData = filteredData.slice(start, end);

    return {
        data: paginatedData,
        total,
        page: params.page,
        limit: params.limit,
    };
}

async function createMessage(data: Omit<Message, "id">): Promise<Message> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newMessage: Message = {
        id: Date.now(),
        ...data,
    };
    console.log("[API] Created message:", newMessage);
    return newMessage;
}

async function deleteMessage(id: number): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("[API] Deleted message:", id);
    return { success: true };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Mensajes() {
    // State management
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [saving, setSaving] = useState(false);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMessages({
                page,
                limit: rowsPerPage,
                search: searchValue,
            });
            setMessages(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[Mensajes] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        setPage(0);
    }, [searchValue]);

    // Event handlers
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
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
            if (editingMessage) {
                // Update existing message
                console.log("[Mensajes] Updating message:", editingMessage.id, data);
                // await updateMessage(editingMessage.id, data);
            } else {
                // Create new message
                await createMessage({
                    name: data.name,
                    content: data.content,
                    status: data.status,
                });
            }
            handleCloseModal();
            fetchMessages();
        } catch (err) {
            console.error("[Mensajes] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMessage = async (message: Message) => {
        const confirmed = window.confirm(
            `¿Estás seguro de eliminar el mensaje "${message.name}"?`
        );
        if (!confirmed) return;

        try {
            await deleteMessage(message.id);
            fetchMessages();
        } catch (err) {
            console.error("[Mensajes] Error deleting:", err);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Table columns
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
            id: "status",
            label: "Estatus",
            size: "sm",
            type: "chip",
            chipLabelMap: { active: "En uso", inactive: "Sin uso" },
            chipVariantMap: { active: "success", inactive: "default" } as Record<string, StatusChipVariant>,
        },
    ];

    // Row actions
    const actions: RowAction<Message>[] = [
        {
            id: "edit",
            label: "Editar",
            onClick: handleOpenEditModal,
        },
        {
            id: "delete",
            label: "Eliminar",
            onClick: handleDeleteMessage,
            color: "error",
        },
    ];

    return (
        <MainLayout>
            <HeaderContainer>
                <Title title="Mensajes" />
                <ControlsContainer>
                    <SearchInput
                        size="small"
                        placeholder="Buscar"
                        value={searchValue}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIconStyled />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <CreateButton
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateModal}
                    >
                        Nuevo
                    </CreateButton>
                </ControlsContainer>
            </HeaderContainer>
            <TableCrud
                columns={columns}
                rows={messages}
                actions={actions}
                loading={loading}
                rowKey="id"
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalRows}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onRowClick={handleOpenEditModal}
                emptyMessage="No hay mensajes registrados"
            />

            <MessageFormModal
                open={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleSaveMessage}
                initialValues={
                    editingMessage
                        ? {
                              name: editingMessage.name,
                              content: editingMessage.content,
                              status: editingMessage.status,
                          }
                        : undefined
                }
                loading={saving}
            />
        </MainLayout>
    );
}
