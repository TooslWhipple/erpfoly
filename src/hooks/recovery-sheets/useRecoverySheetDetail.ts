import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoiceDetail } from "@/services/customer-support.service";
import {
  downloadRecoverySheetPdf,
  fetchRecoverySheetPdf,
  getRecoverySheetDetail,
  receiveRecoveryItem,
  updateRecoverySheetStatus,
} from "@/services/recovery-sheets.service";
import { printPdfBlob } from "@/lib/printing";
import type {
  ReceiveRecoveryItemPayload,
  RecoverySheetStatus,
} from "@/types/recovery-sheets.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const STATUS_MENU_OPTIONS: RecoverySheetStatus[] = [
  "pendiente",
  "recuperada",
  "cancelada",
];

export function useRecoverySheetDetail() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const sheetId = typeof router.query.id === "string" ? router.query.id : "";

  const [statusMenuAnchor, setStatusMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [serviceOrderModalOpen, setServiceOrderModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    data: detail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recovery-sheet", sheetId],
    queryFn: async () => {
      const result = await getRecoverySheetDetail(sheetId);
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error("Hoja de recuperación no encontrada");
      return result.data;
    },
    enabled: Boolean(sheetId),
  });

  const invoiceQuery = useQuery({
    queryKey: ["recovery-sheet-invoice", detail?.invoiceId],
    queryFn: async () => {
      if (!detail?.invoiceId) {
        throw new Error("Factura no disponible");
      }
      return getInvoiceDetail(detail.invoiceId);
    },
    enabled: Boolean(detail?.invoiceId),
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      showError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la hoja de recuperación",
      );
    }
  }, [error, isError, showError]);

  const statusMutation = useMutation({
    mutationFn: async (status: RecoverySheetStatus) => {
      const result = await updateRecoverySheetStatus(sheetId, status);
      if (result.error || !result.data) {
        throw new Error(
          result.error?.message ?? "No se pudo actualizar el estatus",
        );
      }
      return result.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["recovery-sheet", sheetId], updated);
      void queryClient.invalidateQueries({ queryKey: ["recovery-sheets"] });
      void queryClient.invalidateQueries({
        queryKey: ["recovery-sheet-pdf", sheetId],
      });
      showSuccess("Estatus actualizado correctamente.");
    },
    onError: (mutationError) => {
      showError(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo actualizar el estatus.",
      );
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async (payload: ReceiveRecoveryItemPayload) => {
      const result = await receiveRecoveryItem(sheetId, payload);
      if (result.error || !result.data) {
        throw new Error(
          result.error?.message ??
            "No se pudo registrar la recepción del artículo",
        );
      }
      return result.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["recovery-sheet", sheetId], updated);
      void queryClient.invalidateQueries({ queryKey: ["recovery-sheets"] });
      void queryClient.invalidateQueries({
        queryKey: ["recovery-sheet-pdf", sheetId],
      });
      setReceiveModalOpen(false);
      showSuccess("Artículo recibido correctamente.");
    },
    onError: (mutationError) => {
      showError(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo registrar la recepción del artículo.",
      );
    },
  });

  const breadcrumbs = useMemo(
    () => [
      {
        label: "Hojas de recuperación",
        href: "/inventario/hojas-recuperacion",
      },
      { label: detail?.folio ?? "..." },
    ],
    [detail?.folio],
  );

  const handleBack = useCallback(() => {
    void router.push("/inventario/hojas-recuperacion");
  }, [router]);

  const handleInvoiceClick = useCallback(() => {
    if (!detail?.invoiceId) return;
    void router.push(`/atencion-cliente/${detail.invoiceId}`);
  }, [detail?.invoiceId, router]);

  const handleStatusSelect = useCallback(
    (status: RecoverySheetStatus) => {
      setStatusMenuAnchor(null);
      if (!detail) return;

      if (status === "recuperada" && !detail.warehouse) {
        setReceiveModalOpen(true);
        return;
      }

      statusMutation.mutate(status);
    },
    [detail, statusMutation],
  );

  const handleReceiveConfirm = useCallback(
    (payload: ReceiveRecoveryItemPayload) => {
      receiveMutation.mutate(payload);
    },
    [receiveMutation],
  );

  const handleDownload = useCallback(async () => {
    if (!sheetId) return;
    try {
      await downloadRecoverySheetPdf(sheetId);
    } catch (downloadError) {
      console.error("[RecoverySheetDetail] Download error:", downloadError);
      showError(
        downloadError instanceof Error && downloadError.message.trim()
          ? downloadError.message
          : "No se pudo descargar la hoja de recuperación.",
      );
    }
  }, [sheetId, showError]);

  const handlePrint = useCallback(async () => {
    if (!sheetId) return;
    setIsPrinting(true);
    try {
      const { blob } = await queryClient.fetchQuery({
        queryKey: ["recovery-sheet-pdf", sheetId],
        queryFn: () => fetchRecoverySheetPdf(sheetId),
        staleTime: 5 * 60_000,
      });
      await printPdfBlob(blob);
    } catch (printError) {
      console.error("[RecoverySheetDetail] Print error:", printError);
      showError(
        printError instanceof Error && printError.message.trim()
          ? printError.message
          : "No se pudo imprimir la hoja de recuperación.",
      );
    } finally {
      setIsPrinting(false);
    }
  }, [queryClient, sheetId, showError]);

  const closeReceiveModal = useCallback(() => {
    if (receiveMutation.isPending) return;
    setReceiveModalOpen(false);
  }, [receiveMutation.isPending]);

  const closeServiceOrderModal = useCallback(() => {
    setServiceOrderModalOpen(false);
  }, []);

  const openServiceOrderModal = useCallback(() => {
    setServiceOrderModalOpen(true);
  }, []);

  const openRoute = useCallback(() => {
    void router.push("/rutas");
  }, [router]);

  return {
    detail,
    invoice: invoiceQuery.data ?? null,
    isInvoiceLoading: invoiceQuery.isLoading,
    isLoading,
    isSaving: statusMutation.isPending || receiveMutation.isPending,
    isPrinting,
    breadcrumbs,
    statusMenuAnchor,
    statusMenuOptions: STATUS_MENU_OPTIONS,
    receiveModalOpen,
    serviceOrderModalOpen,
    setStatusMenuAnchor,
    handleBack,
    handleInvoiceClick,
    handleStatusSelect,
    handleReceiveConfirm,
    handleDownload,
    handlePrint,
    closeReceiveModal,
    closeServiceOrderModal,
    openServiceOrderModal,
    openRoute,
    receiveMutationPending: receiveMutation.isPending,
  };
}
