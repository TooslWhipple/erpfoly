export const ROLE_CODES = {
  CHOFER: "CHOFER",
  AYUDANTE_CHOFER: "AYUDANTE_CHOFER",
  CAJERO: "CAJERO",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export function isDriverRoleCode(code: string | undefined): boolean {
  return code === ROLE_CODES.CHOFER || code === ROLE_CODES.AYUDANTE_CHOFER;
}
