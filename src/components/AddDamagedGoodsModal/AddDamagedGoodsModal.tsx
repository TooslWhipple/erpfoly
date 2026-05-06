"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FormControl,
    FormHelperText,
    Stack,
    Typography,
    Alert,
    Box,
    CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ModalFormZod } from "@/components/ModalFormZod";
import { TabFilters } from "@/components/TabFilters";
import type { TabOption } from "@/components/TabFilters";
import { RadioButton, RadioButtonGroup } from "@/components/RadioButton";
import { DamagedGoodsProductSearchField } from "./DamagedGoodsProductSearchField";
import { defineFormFields, messages, FormField, type SchemaOutputFromFields } from "@/forms";
import type { SelectOption } from "@/components/Form";
import {
    getDamagedProductsCatalog,
    type DamagedProductCatalogItem,
    type DamagedProductsCatalogData,
} from "@/services/damaged-products.service";
import { getApiErrorMessage } from "@/lib/axios";

interface AddDamagedGoodsFormShape extends Record<string, unknown> {
    productId: number;
    damageOrigin: string;
    damageType: string;
    serialNumber: string;
    damageDetected: string;
    observations: string;
    damagedProductDisposition: string;
}

const addDamagedGoodsFormFields = defineFormFields<AddDamagedGoodsFormShape>()([
    {
        name: "productId",
        schema: z.number().int().positive({ message: messages.required }),
        label: "Producto",
    },
    {
        name: "damageOrigin",
        schema: z.string().min(1, messages.required),
        label: "Origen del daño",
    },
    {
        name: "damageType",
        schema: z.string().min(1, messages.required),
        label: "Tipo de daño",
        type: "select",
        placeholder: "Seleccione",
    },
    {
        name: "serialNumber",
        schema: z.string(),
        label: "Número de serie",
        type: "text",
        placeholder: "Ingrese",
    },
    {
        name: "damageDetected",
        schema: z.string().trim().min(1, messages.required),
        label: "Daño detectado",
        type: "textarea",
        placeholder: "Ingrese",
        rows: 2,
    },
    {
        name: "observations",
        schema: z.string(),
        label: "Observaciones",
        type: "textarea",
        placeholder: "Ingrese",
        rows: 2,
    },
    {
        name: "damagedProductDisposition",
        schema: z.string().min(1, messages.required),
        label: "Disposición del producto",
    },
] as const);

export type AddDamagedGoodsFormValues = SchemaOutputFromFields<typeof addDamagedGoodsFormFields>;

const EMPTY_DEFAULTS: AddDamagedGoodsFormShape = {
    productId: 0,
    damageOrigin: "",
    damageType: "",
    serialNumber: "",
    damageDetected: "",
    observations: "",
    damagedProductDisposition: "",
};

function catalogItemIdString(item: DamagedProductCatalogItem): string {
    return String(item.id);
}

function buildDefaultValuesFromCatalog(catalog: DamagedProductsCatalogData): AddDamagedGoodsFormShape {
    return {
        productId: 0,
        damageOrigin:
            catalog.damageOrigins[0] != null
                ? catalogItemIdString(catalog.damageOrigins[0])
                : "",
        damageType:
            catalog.damageTypes[0] != null ? catalogItemIdString(catalog.damageTypes[0]) : "",
        serialNumber: "",
        damageDetected: "",
        observations: "",
        damagedProductDisposition:
            catalog.dispositions[0] != null
                ? catalogItemIdString(catalog.dispositions[0])
                : "",
    };
}

const MODAL_TABS: TabOption[] = [
    { label: "Reporte", value: "report" },
    { label: "Indicaciones y solución", value: "instructions" },
];

function formatFieldErrors(errors: unknown[]): string | undefined {
    if (!errors?.length) {
        return undefined;
    }
    return errors.map((item) => (typeof item === "string" ? item : String(item))).join(", ");
}

function catalogContainsId(list: DamagedProductCatalogItem[], selected: string): boolean {
    return list.some((item) => catalogItemIdString(item) === selected);
}

export interface AddDamagedGoodsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (values: AddDamagedGoodsFormValues) => Promise<void>;
}

export function AddDamagedGoodsModal({ open, onClose, onSubmit }: AddDamagedGoodsModalProps) {
    const [activeTab, setActiveTab] = useState<string>("report");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const catalogQuery = useQuery({
        queryKey: ["damaged-products-catalog"],
        queryFn: async () => {
            const result = await getDamagedProductsCatalog();
            if (result.error != null) {
                throw new Error(result.error.message);
            }
            if (result.data == null) {
                throw new Error("Catálogo vacío");
            }
            return result.data;
        },
        enabled: open,
        staleTime: 5 * 60 * 1000,
    });

    const catalog = catalogQuery.data;
    const catalogRef = useRef<DamagedProductsCatalogData | null>(null);
    catalogRef.current = catalog ?? null;

    const schemaSuperRefine = useCallback((data: AddDamagedGoodsFormValues, ctx: z.RefinementCtx) => {
        const c = catalogRef.current;
        if (c == null) {
            return;
        }
        const assertIn = (
            list: DamagedProductCatalogItem[],
            value: string,
            path: keyof AddDamagedGoodsFormValues,
        ) => {
            if (!catalogContainsId(list, value)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: messages.required,
                    path: [path],
                });
            }
        };
        assertIn(c.damageOrigins, data.damageOrigin, "damageOrigin");
        assertIn(c.damageTypes, data.damageType, "damageType");
        assertIn(c.dispositions, data.damagedProductDisposition, "damagedProductDisposition");
    }, []);

    const defaultValues = useMemo(() => {
        if (catalog == null) {
            return EMPTY_DEFAULTS;
        }
        return buildDefaultValuesFromCatalog(catalog);
    }, [catalog]);

    const damageTypeOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) {
            return [];
        }
        return catalog.damageTypes.map((item) => ({
            value: catalogItemIdString(item),
            label: item.label,
        }));
    }, [catalog]);

    useEffect(() => {
        if (open) {
            setActiveTab("report");
            setSubmitError(null);
        }
    }, [open]);

    const handleSubmit = useCallback(
        async (values: AddDamagedGoodsFormValues) => {
            setSubmitError(null);
            setSubmitting(true);
            try {
                const runSubmit =
                    onSubmit ??
                    (async () => {
                        await new Promise((r) => setTimeout(r, 800));
                    });
                await runSubmit(values);
                onClose();
            } catch (err) {
                setSubmitError(err instanceof Error ? err.message : "Error al guardar");
            } finally {
                setSubmitting(false);
            }
        },
        [onSubmit, onClose],
    );

    const modalKey = open
        ? catalog
            ? "damaged-form-ready"
            : "damaged-form-wait-catalog"
        : "damaged-form-closed";

    const catalogErrorMessage =
        catalogQuery.isError ? getApiErrorMessage(catalogQuery.error) : null;

    return (
        <ModalFormZod
            key={modalKey}
            open={open}
            onClose={onClose}
            title="Agregar mercancía dañada"
            fields={addDamagedGoodsFormFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            confirmLabel="Agregar"
            loading={submitting || catalogQuery.isPending}
            maxWidth="md"
            fullWidth
            validateOn="blur"
            customFieldLayout
            schemaSuperRefine={schemaSuperRefine}
        >
            {({ form }) => (
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <TabFilters
                        tabs={MODAL_TABS}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {catalogQuery.isPending && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={32} />
                        </Box>
                    )}

                    {catalogErrorMessage != null && !catalogQuery.isPending && (
                        <Alert severity="error" onClose={() => catalogQuery.refetch()}>
                            {catalogErrorMessage}
                        </Alert>
                    )}

                    {submitError != null && (
                        <Alert severity="error" onClose={() => setSubmitError(null)}>
                            {submitError}
                        </Alert>
                    )}

                    {catalog != null && !catalogQuery.isPending && (
                        <>
                            {activeTab === "report" && (
                                <Stack spacing={2}>
                                    <DamagedGoodsProductSearchField
                                        form={form}
                                        fetchEnabled={open && activeTab === "report"}
                                        disabled={submitting}
                                    />

                                    <form.Field name="damageOrigin">
                                        {(field) => {
                                            const errorMessage = formatFieldErrors(
                                                field.state.meta.errors,
                                            );
                                            const showError = !field.state.meta.isValid;
                                            return (
                                                <FormControl
                                                    component="fieldset"
                                                    variant="standard"
                                                    error={showError}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        Selecciona el origen del daño
                                                    </Typography>
                                                    <RadioButtonGroup sx={{ flexWrap: "wrap" }}>
                                                        {catalog.damageOrigins.map((opt) => {
                                                            const idStr = catalogItemIdString(opt);
                                                            return (
                                                                <RadioButton
                                                                    key={idStr}
                                                                    value={idStr}
                                                                    label={opt.label}
                                                                    checked={field.state.value === idStr}
                                                                    onChange={(e) => {
                                                                        field.handleChange(e.target.value);
                                                                        field.handleBlur();
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </RadioButtonGroup>
                                                    {showError && errorMessage != null && (
                                                        <FormHelperText>{errorMessage}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            );
                                        }}
                                    </form.Field>

                                    <FormField
                                        form={form}
                                        name="damageType"
                                        label="Tipo de daño"
                                        placeholder="Seleccione"
                                        type="select"
                                        options={damageTypeOptions}
                                    />

                                    <FormField
                                        form={form}
                                        name="serialNumber"
                                        label="Número de serie"
                                        placeholder="Ingrese"
                                        type="text"
                                    />

                                    <FormField
                                        form={form}
                                        name="damageDetected"
                                        label="Daño detectado"
                                        placeholder="Ingrese"
                                        type="textarea"
                                        rows={2}
                                    />

                                    <FormField
                                        form={form}
                                        name="observations"
                                        label="Observaciones"
                                        placeholder="Ingrese"
                                        type="textarea"
                                        rows={2}
                                    />
                                </Stack>
                            )}

                            {activeTab === "instructions" && (
                                <Stack spacing={2}>
                                    <form.Field name="damagedProductDisposition">
                                        {(field) => {
                                            const errorMessage = formatFieldErrors(
                                                field.state.meta.errors,
                                            );
                                            const showError = !field.state.meta.isValid;
                                            return (
                                                <FormControl
                                                    component="fieldset"
                                                    variant="standard"
                                                    error={showError}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        ¿Qué se hará con el producto?
                                                    </Typography>
                                                    <RadioButtonGroup
                                                        sx={{
                                                            display: "grid",
                                                            gridTemplateColumns: {
                                                                xs: "1fr",
                                                                sm: "1fr 1fr",
                                                            },
                                                            gap: 1,
                                                        }}
                                                    >
                                                        {catalog.dispositions.map((opt) => {
                                                            const idStr = catalogItemIdString(opt);
                                                            return (
                                                                <RadioButton
                                                                    key={idStr}
                                                                    value={idStr}
                                                                    label={opt.label}
                                                                    checked={field.state.value === idStr}
                                                                    onChange={(e) => {
                                                                        field.handleChange(e.target.value);
                                                                        field.handleBlur();
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </RadioButtonGroup>
                                                    {showError && errorMessage != null && (
                                                        <FormHelperText>{errorMessage}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            );
                                        }}
                                    </form.Field>
                                </Stack>
                            )}
                        </>
                    )}
                </Stack>
            )}
        </ModalFormZod>
    );
}
