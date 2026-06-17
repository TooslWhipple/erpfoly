export { schemas } from "./common";

export { validateGeneralForm, type GeneralSchemaInput } from "./proveedores";

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
