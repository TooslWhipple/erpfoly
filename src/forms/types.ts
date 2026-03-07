export type FormFieldInputType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "autocomplete";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface AutocompleteItem {
  id: string | number;
  label: string;
}
