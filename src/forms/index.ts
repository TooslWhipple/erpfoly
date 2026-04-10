/**
 * Forms module: validation, field definitions, hooks, and components.
 * Single entry point; internal structure is validation | fields | hooks | components.
 */

export type { FormFieldInputType, SelectOption, AutocompleteItem } from "./types";

export { messages, schemas, filters, validateGeneralForm } from "./validation";
export type { InputFilter, GeneralSchemaInput } from "./validation";

export { buildSchema, defineFormFields } from "./fields";
export type {
    FormFieldDefinition,
    SchemaOutputFromFields,
    SchemaInputFromFields,
} from "./fields";

export { useFormWithZod, useFormFromFields } from "./hooks";
export type { UseFormWithZodOptions } from "./hooks";
export type { UseFormFromFieldsOptions, UseFormFromFieldsResult } from "./hooks";

export { FormField, FormFromFields, FormSubmitActions } from "./components";
export type { FormFromFieldsProps, FormSubmitActionsProps } from "./components";
