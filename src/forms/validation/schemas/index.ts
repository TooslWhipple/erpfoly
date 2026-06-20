export { schemas } from "./common";

export {
    validateGeneralForm,
    validateContactsForm,
    validateCreditForm,
    SUPPLIER_TEXT_MAX_LENGTH,
    type GeneralSchemaInput,
    type ContactsSchemaInput,
    type CreditSchemaInput,
} from "./proveedores";

export { sanitizeMxPostalCodeInput, isValidMxPostalCode } from "./mxPostalCode";

export {
  sanitizeCurp,
  isValidCurp,
  sanitizeRfc,
  isValidRfc,
  sanitizePhone,
  isValidPhone,
  isValidEmail,
  isValidPostalCode,
  sanitizeLettersOnly,
  isValidLettersOnly,
  sanitizeDecimal,
  isValidDecimal,
  isValidNumber,
} from "./creditApplication";
