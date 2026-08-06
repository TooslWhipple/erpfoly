export interface SegmentoNegocio {
  id: number;
  codigo: string;
  nombre: string;
}

export interface CuentaContableDetalle {
  id: number;
  cuenta: string;
  nombre: string;
}

export interface MovimientoPoliza {
  id: number;
  idpoliza: number;
  numero: number;
  cuenta: string;
  referencia: string | null;
  concepto: string | null;
  idsegmentodenegocio: number | null;
  escargo: number; // 1 = Cargo, 0 = Abono
  importe: number | string;
  created_at?: string;
  segmento?: SegmentoNegocio | null;
  cuentaDetalle?: CuentaContableDetalle | null;
}

export interface PolizaSistemaInfo {
  id: number;
  clave: string;
  descripcion: string;
}

export type EstatusPoliza = 'ACTIVA' | 'ENVIADA' | 'ERROR' | 'REGENERAR';

export interface Poliza {
  id: number;
  idpolizasistema: number;
  idtipopoliza: number; // 1: Ingresos, 2: Egresos, 3: Diario
  numero: number;
  fecha: string;
  concepto: string;
  estatus: EstatusPoliza;
  error?: string | null;
  created_at?: string;
  updated_at?: string;
  movimientos: MovimientoPoliza[];
  polizaSistema?: PolizaSistemaInfo | null;
}

export interface FilterPolizasParams {
  fechaInicio?: string;
  fechaFin?: string;
  idpolizasistema?: number;
  estatus?: EstatusPoliza;
}
