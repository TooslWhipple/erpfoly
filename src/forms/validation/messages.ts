/**
 * Default validation error messages (Spanish).
 * Used by schemas and can be overridden per-schema.
 */
export const messages = {
    required: "Es requerido",
    invalidType: "Valor inválido",
    string: {
        min: (min: number) => `Debe tener al menos ${min} caracteres`,
        max: (max: number) => `Debe tener máximo ${max} caracteres`,
        email: "El correo no es válido",
        url: "La URL no es válida",
        phone: "El teléfono debe tener 10 dígitos",
    },
    number: {
        min: (min: number) => `Debe ser al menos ${min}`,
        max: (max: number) => `Debe ser máximo ${max}`,
    },
} as const;
