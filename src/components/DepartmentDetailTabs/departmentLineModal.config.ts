import {
  defineFormFields,
  schemas,
  type SchemaInputFromFields,
  type SchemaOutputFromFields,
} from "@/forms";
import { messages } from "@/forms/validation/messages";
import type { OriginPromotionPayload, ProductLineItem } from "@/services/product-lines.service";
import { z } from "zod";

export interface DepartmentLineTableRow extends ProductLineItem {
  articles: number;
}

export type LineFormShape = {
  code: string;
  name: string;
  hasLinePromotion: boolean;
  promotionPercentage: string;
  promotionStartDate: string;
  promotionEndDate: string;
};

export const departmentLineFormFields = defineFormFields<LineFormShape>()([
  {
    name: "name",
    schema: schemas
      .requiredString(2, "El nombre de la línea es requerido")
      .max(128, messages.string.max(128)),
    label: "Nombre de la categoría",
    type: "text",
    placeholder: "Ej. Sillas",
  },
  {
    name: "code",
    schema: schemas
      .requiredString(1, "La abreviación es requerida")
      .max(32, messages.string.max(32))
      .transform((s) => s.toUpperCase()),
    label: "Abreviación",
    type: "text",
    placeholder: "Ej. SL",
    filter: (v) => v.toUpperCase(),
  },
  {
    name: "hasLinePromotion",
    schema: z.boolean(),
    label: "Agregar Promoción para ésta Línea",
    type: "switch",
  },
  {
    name: "promotionPercentage",
    schema: z.string(),
    label: "Promoción",
    type: "number",
    placeholder: "32",
    when: (values) => Boolean(values.hasLinePromotion),
  },
  {
    name: "promotionStartDate",
    schema: z.string(),
    label: "Fecha de inicio",
    type: "date",
    when: (values) => Boolean(values.hasLinePromotion),
  },
  {
    name: "promotionEndDate",
    schema: z.string(),
    label: "Fecha fin",
    type: "date",
    when: (values) => Boolean(values.hasLinePromotion),
  },
] as const);

export type LineFormOutput = SchemaOutputFromFields<typeof departmentLineFormFields>;

export function lineModalSchemaSuperRefine(data: LineFormOutput, ctx: z.RefinementCtx): void {
  if (!data.hasLinePromotion) return;

  const percentageRaw = data.promotionPercentage?.trim() ?? "";
  if (!percentageRaw || Number.isNaN(Number(percentageRaw))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El porcentaje de promoción es requerido",
      path: ["promotionPercentage"],
    });
  } else {
    const value = Number(percentageRaw);
    if (value < 0 || value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El porcentaje debe estar entre 0 y 100",
        path: ["promotionPercentage"],
      });
    }
  }

  const startDate = data.promotionStartDate?.trim() ?? "";
  const endDate = data.promotionEndDate?.trim() ?? "";
  if (!startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de inicio es requerida",
      path: ["promotionStartDate"],
    });
  }
  if (!endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha fin es requerida",
      path: ["promotionEndDate"],
    });
  }
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha fin debe ser posterior a la fecha de inicio",
      path: ["promotionEndDate"],
    });
  }
}

export function buildLineModalDefaultValues(
  editingLine: ProductLineItem | null,
): SchemaInputFromFields<typeof departmentLineFormFields> {
  if (editingLine) {
    const hasPromotion = Boolean(editingLine.promotion);
    return {
      name: editingLine.name,
      code: (editingLine.code ?? "").toUpperCase(),
      hasLinePromotion: hasPromotion,
      promotionPercentage:
        editingLine.promotion?.percentage != null
          ? String(editingLine.promotion.percentage)
          : "",
      promotionStartDate: editingLine.promotion?.startDate ?? "",
      promotionEndDate: editingLine.promotion?.endDate ?? "",
    };
  }
  return {
    name: "",
    code: "",
    hasLinePromotion: false,
    promotionPercentage: "",
    promotionStartDate: "",
    promotionEndDate: "",
  };
}

export function buildLinePromotionPayload(
  data: LineFormOutput,
): OriginPromotionPayload | undefined {
  if (!data.hasLinePromotion) {
    return undefined;
  }

  return {
    discount_rate: Number(data.promotionPercentage),
    start_date: data.promotionStartDate,
    end_date: data.promotionEndDate || null,
  };
}
