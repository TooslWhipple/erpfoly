import {
  defineFormFields,
  schemas,
  type SchemaInputFromFields,
  type SchemaOutputFromFields,
} from "@/forms";
import { messages } from "@/forms/validation/messages";
import type { ProductLineItem } from "@/services/product-lines.service";

export interface DepartmentLineTableRow extends ProductLineItem {
  articles: number;
}

export type LineFormShape = {
  code: string;
  name: string;
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
] as const);

export type LineFormOutput = SchemaOutputFromFields<typeof departmentLineFormFields>;

export function buildLineModalDefaultValues(
  editingLine: ProductLineItem | null,
): SchemaInputFromFields<typeof departmentLineFormFields> {
  if (editingLine) {
    return {
      name: editingLine.name,
      code: (editingLine.code ?? "").toUpperCase(),
    };
  }
  return {
    name: "",
    code: "",
  };
}
