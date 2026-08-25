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
import { FormTextField } from "@/components/Form/FormTextField";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
    getDamagedProductsCatalog,
    getDamagedProductBranchesWithStock,
    createDamagedProduct,
    getDamagedProduct,
    updateDamagedProduct,
    type CreateDamagedProductPayload,
    type UpdateDamagedProductPayload,
    type DamagedProductCatalogItem,
    type DamagedProductsCatalogData,
    type DamagedProductDetail,
    type RepairCostAssignee,
} from "@/services/damaged-products.service";
import { getProductById } from "@/services/productos.service";
import { getApiErrorMessage } from "@/lib/axios";
import { FileUpload } from "@/components/FileUpload";
import type { UploadedFileItem } from "@/components/FileUpload";

const DISPOSITION_CODES = {
    INTERNAL_REPAIR: "INTERNAL_MAINTENANCE",
    SUPPLIER_REPAIR: "REPAIR_WITH_SUPPLIER",
    AUCTION_SALE: "CLEARENCE_SALE",
    RETURN_TO_SUPPLIER: "RETURN_TO_SUPPLIER",
} as const;

const REPAIR_COST_ASSIGNEE_OPTIONS: { value: RepairCostAssignee; label: string }[] = [
    { value: "supplier", label: "Proveedor" },
    { value: "foly", label: "Foly" },
];

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
    repairCostAssignedTo: RepairCostAssignee | "";
    chargedSupplierId: string;
    auctionPrice: string;
    acceptanceLetter: UploadedFileItem[];
}

const addDamagedGoodsFormFields = defineFormFields<AddDamagedGoodsFormShape>()([
    {
        name: "productId",
        schema: z.number().int().positive({ message: messages.required }),
        label: "Artículo",
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
        label: "Disposición del artículo",
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
        name: "repairCostAssignedTo",
        schema: z.enum(["", "supplier", "foly"]),
        label: "¿Quién absorbe el costo?",
    },
    {
        name: "chargedSupplierId",
        schema: z.string(),
        label: "Proveedor a cargar",
        placeholder: "Seleccione proveedor",
        type: "select",
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
    repairCostAssignedTo: "",
    chargedSupplierId: "",
    auctionPrice: "",
    acceptanceLetter: [],
};

function catalogItemIdString(item: DamagedProductCatalogItem): string {
    return String(item.id);
}

function buildDefaultValuesFromCatalog(catalog: DamagedProductsCatalogData): AddDamagedGoodsFormShape {
    return {
        productId: 0,
        branchId: "",
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
        repairCostAssignedTo: "",
        chargedSupplierId: "",
        auctionPrice: "",
        acceptanceLetter: [],
    };
}

/**
 * Builds the form's default values from an existing folio (edit mode).
 *
 * `assignedToId` is only recovered from `repairSupplierId` (the only DB-backed
 * counterpart it has); `responsibleId`, `solutionId`, `endDate` and
 * `chargedSupplierId` have no column at all (`chargedSupplierId` is create-only),
 * so they always start empty in edit mode too.
 */
function buildDefaultValuesFromFolio(folio: DamagedProductDetail): AddDamagedGoodsFormShape {
    return {
        productId: folio.productId,
        branchId: String(folio.branchId),
        damageOrigin: String(folio.damageOriginId),
        damageType: String(folio.damageTypeId),
        serialNumber: folio.serialNumber ?? "",
        damageDetected: folio.damageDescription ?? "",
        observations: folio.observations ?? "",
        damagedProductDisposition: folio.dispositionCode,
        assignedToId: folio.repairSupplierId != null ? String(folio.repairSupplierId) : "",
        responsibleId: "",
        solutionId: "",
        endDate: "",
        includeCost: folio.repairCost != null,
        repairCost: folio.repairCost != null ? String(folio.repairCost) : "",
        repairCostAssignedTo: folio.repairCostAssignedTo ?? "",
        chargedSupplierId: "",
        auctionPrice: folio.auctionPrice != null ? String(folio.auctionPrice) : "",
        acceptanceLetter: [],
    };
}

/**
 * Reempaqueta el cuerpo del `PATCH` como multipart para poder adjuntar la carta.
 * Se deriva del mismo `UpdateDamagedProductPayload` en vez de repetir la lista de
 * campos, para que ambas ramas del envío no puedan divergir.
 */
function buildUpdateFormData(
    payload: UpdateDamagedProductPayload,
    acceptanceLetterFile: File,
    acceptanceLetterName: string,
): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
        if (value != null) {
            formData.append(key, String(value));
        }
    }
    formData.append("acceptanceLetter", acceptanceLetterFile, acceptanceLetterName);
    return formData;
}

/** Nombre visible de la carta ya adjunta: en GCS el objeto es un UUID. */
const ACCEPTANCE_LETTER_NAME = "Carta de aceptación";

/** Referencia estable para el caso «el folio no trae carta». */
const NO_ACCEPTANCE_LETTER: UploadedFileItem[] = [];

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
    /** When set, the modal opens in edit mode, loading and updating this folio instead of creating a new one. */
    damagedProductId?: number | null;
}

type BranchFormApi = {
    setFieldValue: (name: "branchId", value: string) => void;
};

function DamagedGoodsBranchField({
    form,
    productId,
    fetchEnabled,
    disabled = false,
}: {
    form: BranchFormApi & Parameters<typeof FormField>[0]["form"];
    productId: number;
    fetchEnabled: boolean;
    disabled?: boolean;
}) {
    const branchesQuery = useQuery({
        queryKey: ["damaged-products", "branches-with-stock", productId],
        queryFn: async () => {
            const result = await getDamagedProductBranchesWithStock(productId);
            if (result.error != null) {
                throw new Error(result.error.message);
            }
            return result.data ?? [];
        },
        enabled: fetchEnabled && productId > 0,
        staleTime: 30_000,
    });

    const branchOptions: SelectOption[] = useMemo(
        () =>
            (branchesQuery.data ?? []).map((item) => ({
                value: String(item.id),
                label: item.label,
            })),
        [branchesQuery.data],
    );

    const prevProductIdRef = useRef<number>(0);

    useEffect(() => {
        if (productId !== prevProductIdRef.current) {
            prevProductIdRef.current = productId;
            form.setFieldValue("branchId", "");
        }
    }, [productId, form]);

    useEffect(() => {
        if (productId <= 0 || branchesQuery.isFetching) {
            return;
        }
        if (!branchesQuery.isSuccess || branchesQuery.data == null) {
            return;
        }
        if (branchesQuery.data.length === 1) {
            form.setFieldValue("branchId", String(branchesQuery.data[0].id));
        }
    }, [
        productId,
        branchesQuery.isFetching,
        branchesQuery.isSuccess,
        branchesQuery.data,
        form,
    ]);

    const hasProduct = productId > 0;
    const isLoading = hasProduct && branchesQuery.isFetching;
    const noStock =
        hasProduct &&
        branchesQuery.isSuccess &&
        !branchesQuery.isFetching &&
        branchOptions.length === 0;

    let placeholder = "Seleccione";
    if (!hasProduct) {
        placeholder = "Seleccione un artículo";
    } else if (isLoading) {
        placeholder = "Cargando...";
    } else if (noStock) {
        placeholder = "Sin existencia en sucursales";
    }

    return (
        <FormField
            form={form}
            name="branchId"
            label="Sucursal"
            placeholder={placeholder}
            type="select"
            options={branchOptions}
            disabled={disabled || !hasProduct || isLoading || noStock}
        />
    );
}

type ChargedSupplierFormApi = {
    setFieldValue: (name: "chargedSupplierId", value: string) => void;
};

function DamagedGoodsChargedSupplierField({
    form,
    productId,
    fetchEnabled,
    disabled = false,
}: {
    form: ChargedSupplierFormApi & Parameters<typeof FormField>[0]["form"];
    productId: number;
    fetchEnabled: boolean;
    disabled?: boolean;
}) {
    const suppliersQuery = useQuery({
        queryKey: ["products", "detail", productId],
        queryFn: async () => {
            const result = await getProductById(productId);
            if (result.error != null) {
                throw new Error(result.error.message);
            }
            return result.data?.suppliers ?? [];
        },
        enabled: fetchEnabled && productId > 0,
        staleTime: 30_000,
    });

    const supplierOptions: SelectOption[] = useMemo(
        () =>
            (suppliersQuery.data ?? []).map((item) => ({
                value: String(item.supplierId),
                label: item.supplierName ?? `Proveedor ${item.supplierId}`,
            })),
        [suppliersQuery.data],
    );

    const prevProductIdRef = useRef<number>(0);

    useEffect(() => {
        if (productId !== prevProductIdRef.current) {
            prevProductIdRef.current = productId;
            form.setFieldValue("chargedSupplierId", "");
        }
    }, [productId, form]);

    useEffect(() => {
        if (productId <= 0 || suppliersQuery.isFetching) {
            return;
        }
        if (!suppliersQuery.isSuccess || suppliersQuery.data == null) {
            return;
        }
        if (suppliersQuery.data.length === 1) {
            form.setFieldValue("chargedSupplierId", String(suppliersQuery.data[0].supplierId));
        }
    }, [
        productId,
        suppliersQuery.isFetching,
        suppliersQuery.isSuccess,
        suppliersQuery.data,
        form,
    ]);

    const hasProduct = productId > 0;
    const isLoading = hasProduct && suppliersQuery.isFetching;
    const noSuppliers =
        hasProduct &&
        suppliersQuery.isSuccess &&
        !suppliersQuery.isFetching &&
        supplierOptions.length === 0;

    let placeholder = "Seleccione proveedor";
    if (!hasProduct) {
        placeholder = "Seleccione un artículo";
    } else if (isLoading) {
        placeholder = "Cargando...";
    } else if (noSuppliers) {
        placeholder = "El artículo no tiene proveedores registrados";
    }

    return (
        <FormField
            form={form}
            name="chargedSupplierId"
            label="Proveedor a cargar"
            placeholder={placeholder}
            type="select"
            options={supplierOptions}
            disabled={disabled || !hasProduct || isLoading || noSuppliers}
        />
    );
}

export function AddDamagedGoodsModal({
    open,
    onClose,
    onSubmit,
    onSuccess,
    damagedProductId = null,
}: AddDamagedGoodsModalProps) {
    const [activeTab, setActiveTab] = useState<string>("report");
    const [submitting, setSubmitting] = useState(false);
    // `null` significa «el usuario no ha tocado el campo»: mientras siga así manda
    // la carta que trae el folio. En cuanto elige (o quita) un archivo, su elección
    // gana y ningún refetch del folio puede pisarla.
    const [pickedLetter, setPickedLetter] = useState<UploadedFileItem[] | null>(null);
    const showError = useSnackbarStore((s) => s.showError);

    const isEditMode = damagedProductId != null;

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

    const folioQuery = useQuery({
        queryKey: ["damaged-product", damagedProductId],
        queryFn: async () => {
            const result = await getDamagedProduct(damagedProductId as number);
            if (result.error != null) {
                throw new Error(result.error.message);
            }
            if (result.data == null) {
                throw new Error("Folio no encontrado");
            }
            return result.data;
        },
        enabled: open && isEditMode,
        staleTime: 0,
    });

    const folio = isEditMode ? folioQuery.data : undefined;

    // La carta ya adjunta al folio. Se identifica por `acceptanceLetterPath` —la
    // ruta cruda del objeto en GCS, estable entre lecturas— y nunca por
    // `acceptanceLetterUrl`, que es una URL firmada distinta en cada respuesta.
    // La URL sí se refresca aquí (para que «Descargar» no caduque), pero eso es
    // inocuo: si el usuario ya eligió archivo, `pickedLetter` manda.
    const seededLetter = useMemo<UploadedFileItem[]>(() => {
        if (folio?.acceptanceLetterPath == null) {
            return NO_ACCEPTANCE_LETTER;
        }
        return [
            {
                id: `acceptance-letter-${folio.acceptanceLetterPath}`,
                name: ACCEPTANCE_LETTER_NAME,
                url: folio.acceptanceLetterUrl ?? undefined,
                previewUrl: folio.acceptanceLetterPreviewUrl ?? undefined,
            },
        ];
    }, [
        folio?.acceptanceLetterPath,
        folio?.acceptanceLetterUrl,
        folio?.acceptanceLetterPreviewUrl,
    ]);

    const acceptanceLetter = pickedLetter ?? seededLetter;

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
            // `assignedToId` (cuando la disposición es interna), `responsibleId`, `solutionId`
            // y `endDate` no tienen columna en la base de datos: exigirlos en edición
            // bloquearía folios legítimos por un dato que nunca se puede persistir.
            if (!isEditMode) {
                if (!data.assignedToId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["assignedToId"] });
                }
                if (!data.responsibleId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["responsibleId"] });
                }
                if (!data.solutionId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["solutionId"] });
                }
            }
            if (data.includeCost && !data.repairCost) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["repairCost"] });
            }
            if (data.includeCost && !data.repairCostAssignedTo) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["repairCostAssignedTo"] });
            }
            // `chargedSupplierId` no tiene columna en edición (igual que assignedToId
            // et al.): solo se exige al crear, y solo con reparación interna cargada
            // al proveedor.
            if (
                !isEditMode &&
                data.damagedProductDisposition === DISPOSITION_CODES.INTERNAL_REPAIR &&
                data.includeCost &&
                data.repairCostAssignedTo === "supplier" &&
                !data.chargedSupplierId
            ) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["chargedSupplierId"] });
            }
        }

        if (data.damagedProductDisposition === DISPOSITION_CODES.AUCTION_SALE && !data.auctionPrice) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.required, path: ["auctionPrice"] });
        }

        // En edición no se exige carta, en espejo del backend: el `PATCH` tampoco la
        // pide, porque hay folios de devolución a proveedor anteriores a este campo y
        // exigirla bloquearía editarlos por un motivo ajeno al cambio que se hace.
        if (!isEditMode && data.damagedProductDisposition === DISPOSITION_CODES.RETURN_TO_SUPPLIER && acceptanceLetter.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Carta de aceptación es requerida", path: ["acceptanceLetter"] });
        }
    }, [acceptanceLetter.length, isEditMode]);

    const defaultValues = useMemo(() => {
        if (catalog == null) {
            return EMPTY_DEFAULTS;
        }
        if (isEditMode) {
            return folio != null ? buildDefaultValuesFromFolio(folio) : EMPTY_DEFAULTS;
        }
        return buildDefaultValuesFromCatalog(catalog);
    }, [catalog, isEditMode, folio]);

    const damageTypeOptions: SelectOption[] = useMemo(() => {
        if (catalog == null) return [];
        return catalog.damageTypes.map((item) => ({
            value: catalogItemIdString(item),
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
            setPickedLetter(null);
        }
    }, [open]);

    const handleSubmit = useCallback(
        async (values: AddDamagedGoodsFormValues) => {
            setSubmitting(true);
            try {
                if (onSubmit) {
                    await onSubmit(values);
                } else if (isEditMode) {
                    if (damagedProductId == null) {
                        throw new Error("Folio no encontrado");
                    }
                    const dispositionItem = catalogRef.current?.dispositions.find(
                        (d) => (d.code ?? catalogItemIdString(d)) === values.damagedProductDisposition,
                    );
                    const dispositionCode = dispositionItem?.code ?? values.damagedProductDisposition;

                    // Payload filtrado estrictamente a la lista blanca del PATCH: productId,
                    // branchId, quantity y status no son editables, y assignedToId /
                    // responsibleId / solutionId / endDate no tienen columna y el backend
                    // los rechaza (400 forbidNonWhitelisted).
                    const updatePayload: UpdateDamagedProductPayload = {
                        dispositionCode,
                        damageOriginId: parseInt(values.damageOrigin, 10),
                        damageTypeId: parseInt(values.damageType, 10),
                        damageDescription: values.damageDetected,
                        serialNumber: values.serialNumber || undefined,
                        observations: values.observations || undefined,
                    };

                    if (dispositionCode === DISPOSITION_CODES.SUPPLIER_REPAIR ||
                        dispositionCode === DISPOSITION_CODES.RETURN_TO_SUPPLIER) {
                        if (values.assignedToId) {
                            updatePayload.repairSupplierId = parseInt(values.assignedToId, 10);
                        }
                    }

                    if (values.includeCost && values.repairCost) {
                        updatePayload.repairCost = parseFloat(values.repairCost);
                        if (values.repairCostAssignedTo !== "") {
                            updatePayload.repairCostAssignedTo = values.repairCostAssignedTo;
                        }
                    }

                    if (dispositionCode === DISPOSITION_CODES.AUCTION_SALE && values.auctionPrice) {
                        updatePayload.auctionPrice = parseFloat(values.auctionPrice);
                    }

                    // Solo hay archivo que subir si el usuario eligió uno nuevo: la carta
                    // sembrada desde el folio no trae `file`, solo la URL para verla.
                    const letterToUpload =
                        dispositionCode === DISPOSITION_CODES.RETURN_TO_SUPPLIER
                            ? acceptanceLetter.find((item) => item.file != null)
                            : undefined;

                    const result = letterToUpload?.file != null
                        ? await updateDamagedProduct(
                            damagedProductId,
                            buildUpdateFormData(updatePayload, letterToUpload.file, letterToUpload.name),
                        )
                        : await updateDamagedProduct(damagedProductId, updatePayload);
                    if (result.error != null) {
                        throw new Error(result.error.message);
                    }
                    onSuccess?.();
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
                            // «Trabajo asignado a» se llena con el catálogo de contratistas
                            // (repairSuppliers), que es justo lo que el backend exige como
                            // repairSupplierId con esta disposición —y prohíbe con la interna.
                            if (dispositionCode === DISPOSITION_CODES.SUPPLIER_REPAIR) {
                                payload.repairSupplierId = values.assignedToId
                                    ? parseInt(values.assignedToId, 10)
                                    : undefined;
                            }
                            payload.responsibleId = values.responsibleId ? parseInt(values.responsibleId, 10) : undefined;
                            payload.solutionId = values.solutionId ? parseInt(values.solutionId, 10) : undefined;
                            payload.endDate = values.endDate || undefined;
                            if (values.includeCost && values.repairCost) {
                                payload.repairCost = parseFloat(values.repairCost);
                                if (values.repairCostAssignedTo !== "") {
                                    payload.repairCostAssignedTo = values.repairCostAssignedTo;
                                }
                                if (
                                    dispositionCode === DISPOSITION_CODES.INTERNAL_REPAIR &&
                                    values.repairCostAssignedTo === "supplier" &&
                                    values.chargedSupplierId
                                ) {
                                    payload.chargedSupplierId = parseInt(values.chargedSupplierId, 10);
                                }
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
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudo guardar el registro. Intenta de nuevo.";
                showError(message);
            } finally {
                setSubmitting(false);
            }
        },
        [onSubmit, onClose, onSuccess, acceptanceLetter, isEditMode, damagedProductId, showError],
    );

    const dataReady = catalog != null && (!isEditMode || folio != null);
    const dataPending = catalogQuery.isPending || (isEditMode && folioQuery.isPending);

    // El `key` identifica la entidad, nunca el estado de carga: si cambiara al resolver
    // `catalogQuery`/`folioQuery`, React destruiría y recrearía el `Dialog` a media
    // apertura y eso es exactamente el parpadeo. La alineación de los valores por
    // defecto, que llegan por fetch, la resuelve `defaultValuesKey` sin remontar nada.
    const modalKey = open
        ? isEditMode
            ? `damaged-form-edit-${damagedProductId}`
            : "damaged-form-create"
        : "damaged-form-closed";

    // Cambia una sola vez por apertura, cuando catálogo y folio ya están: ese es el
    // instante en que `defaultValues` deja de ser `EMPTY_DEFAULTS`. Un refetch en
    // segundo plano no lo mueve, así que no puede borrar lo que el usuario escribió.
    const defaultValuesKey = dataReady ? "ready" : "loading";

    const catalogErrorMessage =
        catalogQuery.isError ? getApiErrorMessage(catalogQuery.error) : null;
    const folioErrorMessage =
        isEditMode && folioQuery.isError ? getApiErrorMessage(folioQuery.error) : null;
    const errorMessage = catalogErrorMessage ?? folioErrorMessage;

    return (
        <ModalFormZod
            key={modalKey}
            open={open}
            onClose={onClose}
            title={isEditMode ? "Editar mercancía dañada" : "Agregar mercancía dañada"}
            fields={addDamagedGoodsFormFields}
            defaultValues={defaultValues}
            defaultValuesKey={defaultValuesKey}
            onSubmit={handleSubmit}
            confirmLabel={isEditMode ? "Guardar" : "Agregar"}
            loading={submitting || dataPending}
            maxWidth="md"
            fullWidth
            validateOn="change"
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

                    {dataPending && (
                        <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
                            <CircularProgress size={32} />
                        </Stack>
                    )}

                    {errorMessage != null && !dataPending && (
                        <Alert
                            severity="error"
                            onClose={() => {
                                void catalogQuery.refetch();
                                if (isEditMode) {
                                    void folioQuery.refetch();
                                }
                            }}
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    {dataReady && !dataPending && (
                        <>
                            <Stack
                                spacing={2}
                                sx={{ display: activeTab === "report" ? "block" : "none" }}
                            >
                                {isEditMode ? (
                                    <FormTextField
                                        label="Artículo"
                                        value={
                                            folio != null
                                                ? `${folio.product.code} - ${folio.product.name}`
                                                : ""
                                        }
                                        disabled
                                    />
                                ) : (
                                    <DamagedGoodsProductSearchField
                                        form={form}
                                        fetchEnabled={open && activeTab === "report"}
                                        disabled={submitting}
                                    />
                                )}

                                {isEditMode ? (
                                    <FormTextField
                                        label="Sucursal"
                                        value={folio?.branch.name ?? ""}
                                        disabled
                                    />
                                ) : (
                                    <form.Subscribe
                                        selector={(state) =>
                                            Number(
                                                (
                                                    state as {
                                                        values?: { productId?: number };
                                                    }
                                                ).values?.productId ?? 0,
                                            )
                                        }
                                    >
                                        {(productId) => (
                                            <DamagedGoodsBranchField
                                                form={form}
                                                productId={productId}
                                                fetchEnabled={open && productId > 0}
                                                disabled={submitting}
                                            />
                                        )}
                                    </form.Subscribe>
                                )}

                                {isEditMode && (
                                    <FormTextField
                                        label="Cantidad"
                                        value={folio?.quantity ?? ""}
                                        disabled
                                    />
                                )}

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

                            <Stack
                                spacing={2}
                                sx={{ display: activeTab === "instructions" ? "block" : "none" }}
                            >
                                <form.Field name="damagedProductDisposition">
                                    {(field) => {
                                        const dispositionValue = field.state.value as string;
                                        const isRepair = dispositionValue === DISPOSITION_CODES.INTERNAL_REPAIR ||
                                            dispositionValue === DISPOSITION_CODES.SUPPLIER_REPAIR;
                                        const isAuction = dispositionValue === DISPOSITION_CODES.AUCTION_SALE;
                                        const isReturn = dispositionValue === DISPOSITION_CODES.RETURN_TO_SUPPLIER;
                                        // Con reparación con contratista el costo lo absorbe Foly: el
                                        // proveedor del artículo no interviene y el backend lo rechaza.
                                        const assigneeOptions =
                                            dispositionValue === DISPOSITION_CODES.SUPPLIER_REPAIR
                                                ? REPAIR_COST_ASSIGNEE_OPTIONS.filter(
                                                      (opt) => opt.value === "foly",
                                                  )
                                                : REPAIR_COST_ASSIGNEE_OPTIONS;

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
                                                        ¿Qué se hará con el artículo?
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
                                                                        const nextCode = e.target.value;
                                                                        field.handleChange(nextCode);
                                                                        field.handleBlur();
                                                                        if (
                                                                            nextCode ===
                                                                            DISPOSITION_CODES.SUPPLIER_REPAIR
                                                                        ) {
                                                                            form.setFieldValue(
                                                                                "repairCostAssignedTo",
                                                                                (prev: RepairCostAssignee | "") =>
                                                                                    prev === "supplier" ? "" : prev,
                                                                            );
                                                                        }
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
                                                                    <Stack spacing={2}>
                                                                        <FormField
                                                                            form={form}
                                                                            name="repairCost"
                                                                            label="Costo de reparación"
                                                                            placeholder="0.00"
                                                                            type="number"
                                                                        />

                                                                        <form.Field name="repairCostAssignedTo">
                                                                            {(assigneeField) => {
                                                                                const assigneeError = formatFieldErrors(
                                                                                    assigneeField.state.meta.errors,
                                                                                );
                                                                                const showAssigneeError =
                                                                                    !assigneeField.state.meta.isValid;
                                                                                return (
                                                                                    <FormControl
                                                                                        component="fieldset"
                                                                                        variant="standard"
                                                                                        error={showAssigneeError}
                                                                                    >
                                                                                        <Typography
                                                                                            variant="body2"
                                                                                            color="text.secondary"
                                                                                            sx={{ mb: 1 }}
                                                                                        >
                                                                                            ¿Quién absorbe el costo?
                                                                                        </Typography>
                                                                                        <RadioButtonGroup
                                                                                            sx={{ flexWrap: "wrap" }}
                                                                                        >
                                                                                            {assigneeOptions.map((opt) => (
                                                                                                <RadioButton
                                                                                                    key={opt.value}
                                                                                                    value={opt.value}
                                                                                                    label={opt.label}
                                                                                                    checked={
                                                                                                        assigneeField.state
                                                                                                            .value ===
                                                                                                        opt.value
                                                                                                    }
                                                                                                    onChange={(e) => {
                                                                                                        assigneeField.handleChange(
                                                                                                            e.target.value,
                                                                                                        );
                                                                                                        assigneeField.handleBlur();
                                                                                                    }}
                                                                                                />
                                                                                            ))}
                                                                                        </RadioButtonGroup>
                                                                                        {showAssigneeError &&
                                                                                            assigneeError != null && (
                                                                                                <FormHelperText>
                                                                                                    {assigneeError}
                                                                                                </FormHelperText>
                                                                                            )}
                                                                                        {!isEditMode &&
                                                                                            dispositionValue ===
                                                                                                DISPOSITION_CODES.INTERNAL_REPAIR &&
                                                                                            assigneeField.state
                                                                                                .value === "supplier" && (
                                                                                                <form.Subscribe
                                                                                                    selector={(state) =>
                                                                                                        Number(
                                                                                                            (
                                                                                                                state as {
                                                                                                                    values?: {
                                                                                                                        productId?: number;
                                                                                                                    };
                                                                                                                }
                                                                                                            ).values
                                                                                                                ?.productId ?? 0,
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    {(productId) => (
                                                                                                        <DamagedGoodsChargedSupplierField
                                                                                                            form={form}
                                                                                                            productId={
                                                                                                                productId
                                                                                                            }
                                                                                                            fetchEnabled={
                                                                                                                open &&
                                                                                                                productId > 0
                                                                                                            }
                                                                                                            disabled={
                                                                                                                submitting
                                                                                                            }
                                                                                                        />
                                                                                                    )}
                                                                                                </form.Subscribe>
                                                                                            )}
                                                                                    </FormControl>
                                                                                );
                                                                            }}
                                                                        </form.Field>
                                                                    </Stack>
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

                                                        <FormControl component="fieldset" variant="standard">
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ mb: 1 }}
                                                            >
                                                                Carta de aceptación
                                                            </Typography>
                                                            {/*
                                                                El mismo componente en alta y en edición: el card se ve
                                                                igual en los dos modos. En edición la papelera se oculta
                                                                —un folio de devolución a proveedor no debe quedarse sin
                                                                carta— y en su lugar aparece «Reemplazar», que sube un
                                                                archivo nuevo por el mismo `PATCH` multipart. «Ver»
                                                                muestra la carta dentro del ERP: en alta desde el
                                                                archivo local y en edición desde
                                                                `acceptanceLetterPreviewUrl`, que es la única firma sin
                                                                `attachment` —la de «Descargar» bajaría el archivo en
                                                                vez de mostrarlo.
                                                            */}
                                                            <FileUpload
                                                                value={acceptanceLetter}
                                                                onChange={setPickedLetter}
                                                                accept={["image/*", "application/pdf"]}
                                                                placeholder="Subir carta de aceptación"
                                                                allowRemove={!isEditMode}
                                                                allowReplace={isEditMode}
                                                                urlForcesDownload
                                                                allowPreview
                                                            />
                                                        </FormControl>
                                                    </Stack>
                                                )}
                                            </>
                                        );
                                    }}
                                </form.Field>
                            </Stack>
                        </>
                    )}
                </Stack>
            )}
        </ModalFormZod>
    );
}
