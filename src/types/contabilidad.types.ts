export interface AsientoContableConfig {
  id?: number;
  idtipotransaccion?: number;
  afectacion: "CARGO" | "ABONO";
  signo: "+" | "-";
  cuenta: string;
  idtipocuenta: number;
  calculoconfiguracion: string;
  porcentaje?: number;
  idpolizasistema?: number;
  polizaSistema?: PolizaSistema;
  detallado?: boolean;
}

export interface TipoTransaccion {
  id: number;
  clave: string;
  descripcion: string;
  asientosContables?: AsientoContableConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTipoTransaccionDto {
  clave: string;
  descripcion: string;
  asientosContables?: AsientoContableConfig[];
}

export interface UpdateTipoTransaccionDto {
  clave?: string;
  descripcion?: string;
  asientosContables?: AsientoContableConfig[];
}

export interface PolizaSistema {
  id: number;
  clave: string;
  descripcion: string;
  idtipopoliza: number;
  periodicidad?: string;
  siguientediahabil?: boolean;
  tipoPoliza?: {
    id: number;
    nombre: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePolizaSistemaDto {
  clave: string;
  descripcion: string;
  idtipopoliza: number;
  periodicidad?: string;
  siguientediahabil?: boolean;
}

export interface UpdatePolizaSistemaDto {
  clave?: string;
  descripcion?: string;
  idtipopoliza?: number;
  periodicidad?: string;
  siguientediahabil?: boolean;
}

export interface TipoCuenta {
  id: number;
  clave?: string;
  descripcion?: string;
  nombre?: string;
}

export interface AccountingAccountItem {
  id: string | number;
  code?: string;
  codigo?: string;
  name?: string;
  nombre?: string;
  label?: string;
  type?: string;
}
