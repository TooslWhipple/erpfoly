import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Stack } from "@mui/material";
import { MainLayout } from "@/components";
import OrderForm from "@/components/OrderForm";
import { getBranchRequestFull } from "@/services/requests.service";
import { mapBranchOrderStatus } from "@/utils/branchRequest";
import { useSnackbarStore } from "@/store/useSnackbarStore";

type Resolution =
    | { kind: "loading" }
    | { kind: "editable"; orderId: number }
    | { kind: "invalid"; reason: string };

function parseId(id: string | string[] | undefined): number | null {
    if (!id || typeof id !== "string") return null;
    const parsed = Number(id);
    if (!Number.isFinite(parsed) || parsed < 1) return null;
    return parsed;
}

export default function EditarTraspaso() {
    const router = useRouter();
    const { id } = router.query;
    const { showError } = useSnackbarStore();
    const [resolution, setResolution] = useState<Resolution>({ kind: "loading" });

    const initialParsedId = parseId(id);
    const syncInvalidReason =
        id !== undefined && initialParsedId === null
            ? "Identificador de traspaso inválido."
            : null;

    useEffect(() => {
        if (initialParsedId === null) return;

        let cancelled = false;

        const checkStatus = async () => {
            try {
                const result = await getBranchRequestFull(initialParsedId);
                if (cancelled) return;

                if (!result.data) {
                    setResolution({ kind: "invalid", reason: "No se encontró el traspaso." });
                    return;
                }

                const status = mapBranchOrderStatus(result.data.status);
                if (status !== "pending") {
                    setResolution({
                        kind: "invalid",
                        reason: "Este traspaso no puede editarse porque su estatus no es pendiente.",
                    });
                    return;
                }

                setResolution({ kind: "editable", orderId: initialParsedId });
            } catch {
                if (cancelled) return;
                setResolution({
                    kind: "invalid",
                    reason: "No se pudo cargar el traspaso. Intenta de nuevo.",
                });
            }
        };

        checkStatus();

        return () => {
            cancelled = true;
        };
    }, [initialParsedId]);

    useEffect(() => {
        if (resolution.kind !== "invalid") return;
        showError(resolution.reason);
        router.replace("/traspasos");
    }, [resolution, showError, router]);

    if (syncInvalidReason) {
        return (
            <RedirectAfterRender reason={syncInvalidReason} />
        );
    }

    if (resolution.kind !== "editable") {
        return (
            <MainLayout>
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    return <OrderForm mode="edit" orderId={resolution.orderId} orderType="internal" />;
}

function RedirectAfterRender({ reason }: { reason: string }) {
    const router = useRouter();
    const { showError } = useSnackbarStore();

    useEffect(() => {
        showError(reason);
        router.replace("/traspasos");
    }, [reason, router, showError]);

    return (
        <MainLayout>
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
                <CircularProgress />
            </Stack>
        </MainLayout>
    );
}
