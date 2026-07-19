export const ROLE_CODES = {
  CHOFER: "CHOFER",
  AYUDANTE_CHOFER: "AYUDANTE_CHOFER",
  CAJERO: "CAJERO",
  ADMINISTRADOR: "ADMINISTRADOR",
  GERENTE: "GERENTE",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export function isDriverRoleCode(code: string | undefined): boolean {
  return code === ROLE_CODES.CHOFER || code === ROLE_CODES.AYUDANTE_CHOFER;
}

// Roles "altos" (gerencia/administración): sugeridos con OTP activado por
// default al crear el usuario. Debe mantenerse en sync con
// `isHighPrivilegeRoleCode` en
// `Apifoly/src/modules/role/constants/role-codes.ts`.
export function isHighPrivilegeRoleCode(code: string | undefined): boolean {
  return code === ROLE_CODES.ADMINISTRADOR || code === ROLE_CODES.GERENTE;
}
