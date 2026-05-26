"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FormControl,
    FormHelperText,
    Stack,
    Typography,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel,
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
    createDamagedProduct,
    type CreateDamagedProductPayload,
    type DamagedProductCatalogItem,
    type DamagedProductsCatalogData,
} from "@/services/damaged-products.service";
import { getApiErrorMessage } from "@/lib/axios";
import { FileUpload } from "@/components/FileUpload";
import type { UploadedFileItem } from "@/components/FileUpload";

const DISPOSITION_CODES = {
    INTERNAL_REPAIR: "INTERNAL_MAINTENANCE",
    SUPPLIER_REPAIR: "REPAIR_WITH_SUPPLIER",
    AUCTION_SALE: "CLEARENCE_SALE",
    RETURN_TO_SUPPLIER: "RETURN_TO_SUPPLIER",
} as const;

interface AddDamagedGoodsFormShape extends Record<string, unknown> {
    productId: number;
    branchId: string;
    damageOrigin: string;
    damageType: string;
    serialNumber: string;
    damageDetected: string;
    observations: string;
    damagedProductDisposition: string;
    assignedToId: string;
    responsibleId: string;
    solutionId: string;
    endDate: string;
    includeCost: boolean;
    repairCost: string;
    auctionPrice: string;
    acceptanceLetter: UploadedFileItem[];
}

const addDamagedGoodsFormFields = defineFormFields<AddDamagedGoodsFormShape>()([
    {
        name: "productId",
        schema: z.number().int().positive({ message: messages.required }),
        label: "Producto",
    },
    {
        name: "branchId",
        schema: z.string().min(1, { message: messages.required }),
        label: "Sucursal",
        type: "select",
        placeholder: "Seleccione",
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
    {
        name: "assignedToId",
        schema: z.string(),
        label: "Trabajo asignado a",
        type: "select",
        placeholder: "Seleccione",
    },
    {
        name: "responsibleId",
        schema: z.string(),
        label: "Responsable",
        type: "select",
        placeholder: "Seleccione",
    },
    {
        name: "solutionId",
        schema: z.string(),
        label: "Solución",
        type: "select",
        placeholder: "Seleccione",
    },
    {
        name: "endDate",
        schema: z.string(),
        label: "Fecha de finalización",
        type: "date",
        placeholder: "Seleccione",
    },
    {
        name: "includeCost",
        schema: z.boolean(),
        label: "¿Agregar costo?",
        type: "switch",
    },
    {
        name: "repairCost",
        schema: z.string(),
        label: "Costo de reparación",
        type: "number",
        placeholder: "0.00",
    },
    {
        name: "auctionPrice",
        schema: z.string(),
        label: "Precio de remate",
        type: "number",
        placeholder: "0.00",
    },
] as const);

export type AddDamagedGoodsFormValues = SchemaOutputFromFields<typeof addDamagedGoodsFormFields>;

const EMPTY_DEFAULTS: AddDamagedGoodsFormShape = {
    productId: 0,
    branchId: "",
    damageOrigin: "",
    damageType: "",
    serialNumber: "",
    damageDetected: "",
    observations: "",
    damagedProductDisposition: "",
    assignedToId: "",
    responsibleId: "",
    solutionId: "",
    endDate: "",
    includeCost: false,
    repairCost: "",
    auctionPrice: "",
    acceptanceLetter: [],
};

function catalogItemIdString(item: DamagedProductCatalogItem): string {
    return String(item.id);
}

function buildDefaultValuesFromCatalog(catalog: DamagedProductsCatalogData): AddDamagedGoodsFormShape {
    return {
        productId: 0,
        branchId: catalog.branches[0]?.id ? String(catalog.branches[0].id) : "",
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
                ? catalog.dispositions[0].code ?? catalogItemIdString(catalog.dispositions[0])
                : "",
        assignedToId: "",
        responsibleId: "",
        solutionId: "",
        endDate: "",
        includeCost: false,
        repairCost: "",
        auctionPrice: "",
        acceptanceLetter: [],
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
    onSuccess?: () => void;
}

export function AddDamagedGoodsModal({ open, onClose, onSubmit, onSuccess }: AddDamagedGoodsModalProps) {
    const [activeTab, setActiveTab] = useState<string>("report");
    const [submitting, setSubmitting] = useState(false);
    const [acceptanceLetter, setAcceptanceLetter] = useState<UploadedFileItem[]>([]);

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
            if (value && !catalogContainsId(list, value)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: messages.required,
                    path: [path],
                });
            }
        };
        assertIn(c.damageOrigins, data.damageOrigin, "damageOrigin");
        assertIn(c.damageTypes, data.damageType, "damageType");
        const dispositionInCatalog = c.dispositions.some(
            (item) => (item.code ?? catalogItemIdString(item)) === data.damagedProductDisposition,
        );
        if (!dispositionInCatalog) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: messages.required,
                path: ["damagedProductDisposition"],
            });
        }

        if (data.damagedProductDisposition === DISPOSITION_CODES.INTERNAL_REPAIR ||
            data.damagedProductDisposition === DISPOSITION_CODES.SUPPLIER_REPAIR) {
            if (!data.assignedToId) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["assignedToId"] });
            }
            if (!data.responsibleId) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["responsibleId"] });
            }
            if (!data.solutionId) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["solutionId"] });
            }
            if (data.includeCost && !data.repairCost) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["repairCost"] });
            }
        }

        if (data.damagedProductDisposition === DISPOSITION_CODES.AUCTION_SALE && !data.auctionPrice) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["auctionPrice"] });
        }

        if (data.damagedProductDisposition === DISPOSITION_CODES.RETURN_TO_SUPPLIER && acceptanceLetter.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Carta de aceptación es requerida", path: ["acceptanceLetter"] });
        }
    }, [acceptanceLetter.length]);

    const defaultValues = useMemo(() => {
        if (catalog == null) {
            return EMPTY_DEFAULTS;
        }
        return buildDefaultValuesFromCatalog(catalog);
    }, [catalog]);

    const damageTypeOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) return [];
        return catalog.damageTypes.map((item) => ({
            value: catalogItemIdString(item),
            label: item.label,
        }));
    }, [catalog]);

    const branchOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) return [];
        return catalog.branches.map((item) => ({
            value: String(item.id),
            label: item.label,
        }));
    }, [catalog]);

    const repairSupplierOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) return [];
        return (catalog.repairSuppliers ?? []).map((item) => ({
            value: String(item.id),
            label: item.label,
        }));
    }, [catalog]);

    const repairResponsibleOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) return [];
        return (catalog.repairResponsibles ?? []).map((item) => ({
            value: String(item.id),
            label: item.label,
        }));
    }, [catalog]);

    const solutionOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) return [];
        return (catalog.solutions ?? []).map((item) => ({
            value: String(item.id),
            label: item.label,
        }));
    }, [catalog]);

    useEffect(() => {
        if (open) {
            setActiveTab("report");
            setAcceptanceLetter([]);
        }
    }, [open]);

    const handleSubmit = useCallback(
        async (values: AddDamagedGoodsFormValues) => {
            setSubmitting(true);
            try {
                if (onSubmit) {
                    await onSubmit(values);
                } else {
                    const dispositionItem = catalogRef.current?.dispositions.find(
                        (d) => (d.code ?? catalogItemIdString(d)) === values.damagedProductDisposition,
                    );
                    const dispositionCode = dispositionItem?.code ?? values.damagedProductDisposition;

                    const useFormData = dispositionCode === DISPOSITION_CODES.RETURN_TO_SUPPLIER && acceptanceLetter.length > 0;

                    if (useFormData) {
                        const formData = new FormData();
                        formData.append("productId", String(values.productId));
                        formData.append("branchId", String(parseInt(values.branchId, 10)));
                        formData.append("damageOriginId", String(parseInt(values.damageOrigin, 10)));
                        formData.append("damageTypeId", String(parseInt(values.damageType, 10)));
                        formData.append("dispositionCode", dispositionCode);
                        formData.append("damageDescription", values.damageDetected);
                        if (values.serialNumber) formData.append("serialNumber", values.serialNumber);
                        if (values.observations) formData.append("observations", values.observations);

                        const file = acceptanceLetter[0];
                        if (file.file) {
                            formData.append("acceptanceLetter", file.file, file.name);
                        }

                        const result = await createDamagedProduct(formData);
                        if (result.error != null) {
                            throw new Error(result.error.message);
                        }
                    } else {
                        const payload: CreateDamagedProductPayload = {
                            productId: values.productId,
                            branchId: parseInt(values.branchId, 10),
                            damageOriginId: parseInt(values.damageOrigin, 10),
                            damageTypeId: parseInt(values.damageType, 10),
                            dispositionCode,
                            damageDescription: values.damageDetected,
                            serialNumber: values.serialNumber || undefined,
                            observations: values.observations || undefined,
                        };

                        if (dispositionCode === DISPOSITION_CODES.INTERNAL_REPAIR ||
                            dispositionCode === DISPOSITION_CODES.SUPPLIER_REPAIR) {
                            payload.assignedToId = values.assignedToId ? parseInt(values.assignedToId, 10) : undefined;
                            payload.responsibleId = values.responsibleId ? parseInt(values.responsibleId, 10) : undefined;
                            payload.solutionId = values.solutionId ? parseInt(values.solutionId, 10) : undefined;
                            payload.endDate = values.endDate || undefined;
                            if (values.includeCost && values.repairCost) {
                                payload.repairCost = parseFloat(values.repairCost);
                            }
                        }

                        if (dispositionCode === DISPOSITION_CODES.AUCTION_SALE && values.auctionPrice) {
                            payload.auctionPrice = parseFloat(values.auctionPrice);
                        }

                        const result = await createDamagedProduct(payload);
                        if (result.error != null) {
                            throw new Error(result.error.message);
                        }
                    }
                    onSuccess?.();
                }
                onClose();
            } catch (err) {
            } finally {
                setSubmitting(false);
            }
        },
        [onSubmit, onClose, onSuccess, acceptanceLetter],
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
                        <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
                            <CircularProgress size={32} />
                        </Stack>
                    )}

                    {catalogErrorMessage != null && !catalogQuery.isPending && (
                        <Alert severity="error" onClose={() => catalogQuery.refetch()}>
                            {catalogErrorMessage}
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

                                    <FormField
                                        form={form}
                                        name="branchId"
                                        label="Sucursal"
                                        placeholder="Seleccione"
                                        type="select"
                                        options={branchOptions}
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
                                            const dispositionValue = field.state.value as string;
                                            const isRepair = dispositionValue === DISPOSITION_CODES.INTERNAL_REPAIR ||
                                                dispositionValue === DISPOSITION_CODES.SUPPLIER_REPAIR;
                                            const isAuction = dispositionValue === DISPOSITION_CODES.AUCTION_SALE;
                                            const isReturn = dispositionValue === DISPOSITION_CODES.RETURN_TO_SUPPLIER;

                                            const errorMessage = formatFieldErrors(
                                                field.state.meta.errors,
                                            );
                                            const showError = !field.state.meta.isValid;
                                            return (
                                                <>
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
                                                                const codeStr = opt.code ?? catalogItemIdString(opt);
                                                                return (
                                                                    <RadioButton
                                                                        key={codeStr}
                                                                        value={codeStr}
                                                                        label={opt.label}
                                                                        checked={field.state.value === codeStr}
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

                                                    {isRepair && (
                                                        <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <FormField
                                                                form={form}
                                                                name="assignedToId"
                                                                label="Trabajo asignado a"
                                                                placeholder="Seleccione proveedor"
                                                                type="select"
                                                                options={repairSupplierOptions}
                                                            />

                                                            <FormField
                                                                form={form}
                                                                name="responsibleId"
                                                                label="Responsable"
                                                                placeholder="Seleccione responsable"
                                                                type="select"
                                                                options={repairResponsibleOptions}
                                                            />

                                                            <FormField
                                                                form={form}
                                                                name="solutionId"
                                                                label="Solución"
                                                                placeholder="Seleccione solución"
                                                                type="select"
                                                                options={solutionOptions}
                                                            />

                                                            <FormField
                                                                form={form}
                                                                name="endDate"
                                                                label="Fecha de finalización"
                                                                placeholder="Seleccione"
                                                                type="date"
                                                            />

                                                            <form.Field name="includeCost">
                                                                {(costField) => (
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Switch
                                                                                checked={Boolean(costField.state.value)}
                                                                                onChange={(e) => {
                                                                                    costField.handleChange(e.target.checked);
                                                                                }}
                                                                            />
                                                                        }
                                                                        label="¿Agregar costo?"
                                                                    />
                                                                )}
                                                            </form.Field>

                                                            <form.Subscribe
                                                                selector={(state) =>
                                                                    Boolean(
                                                                        (
                                                                            state as {
                                                                                values?: { includeCost?: boolean };
                                                                            }
                                                                        ).values?.includeCost,
                                                                    )
                                                                }
                                                            >
                                                                {(showCost) =>
                                                                    showCost && (
                                                                        <FormField
                                                                            form={form}
                                                                            name="repairCost"
                                                                            label="Costo de reparación"
                                                                            placeholder="0.00"
                                                                            type="number"
                                                                        />
                                                                    )
                                                                }
                                                            </form.Subscribe>
                                                        </Stack>
                                                    )}

                                                    {isAuction && (
                                                        <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Costo de lista: $0.00
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Último precio: $0.00
                                                            </Typography>
                                                            <FormField
                                                                form={form}
                                                                name="auctionPrice"
                                                                label="Precio de remate"
                                                                placeholder="Ingrese precio"
                                                                type="number"
                                                            />
                                                        </Stack>
                                                    )}

                                                    {isReturn && (
                                                        <Stack spacing={2} sx={{ mt: 1 }}>
                                                            <FormField
                                                                form={form}
                                                                name="assignedToId"
                                                                label="Regresar al proveedor"
                                                                placeholder="Seleccione proveedor"
                                                                type="select"
                                                                options={repairSupplierOptions}
                                                            />

                                                            <Typography variant="body2" color="text.secondary">
                                                                Próxima visita del proveedor: --/--/----
                                                            </Typography>

                                                            <FormControl component="fieldset" variant="standard">
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ mb: 1 }}
                                                                >
                                                                    Carta de aceptación
                                                                </Typography>
                                                                <FileUpload
                                                                    value={acceptanceLetter}
                                                                    onChange={setAcceptanceLetter}
                                                                    accept={["image/*", "application/pdf"]}
                                                                    placeholder="Subir carta de aceptación"
                                                                />
                                                            </FormControl>
                                                        </Stack>
                                                    )}
                                                </>
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
