/**
 * Constantes de permisos del sistema
 * Estructura: MODULO_ACCION
 * 
 * Acciones comunes:
 * - VER: Ver listado y detalles
 * - CREAR: Crear nuevos registros
 * - EDITAR: Editar registros existentes
 * - ELIMINAR: Eliminar registros
 * - EXPORTAR: Exportar datos/reportes
 */

// Solicitudes de crédito
export const SOLICITUDES_CREDITO_VER = "solicitudes_credito.ver";
export const SOLICITUDES_CREDITO_CREAR = "solicitudes_credito.crear";
export const SOLICITUDES_CREDITO_EDITAR = "solicitudes_credito.editar";
export const SOLICITUDES_CREDITO_ELIMINAR = "solicitudes_credito.eliminar";
export const SOLICITUDES_CREDITO_APROBAR = "solicitudes_credito.aprobar";

// Cajas
export const CAJAS_VER = "cajas.ver";
export const CAJAS_CREAR = "cajas.crear";
export const CAJAS_EDITAR = "cajas.editar";
export const CAJAS_CERRAR = "cajas.cerrar";

// Clientes
export const CLIENTES_VER = "clientes.ver";
export const CLIENTES_CREAR = "clientes.crear";
export const CLIENTES_EDITAR = "clientes.editar";
export const CLIENTES_ELIMINAR = "clientes.eliminar";
export const CLIENTES_MOROSIDAD_VER = "clientes.morosidad.ver";
export const CLIENTES_COBRANZA_VER = "clientes.cobranza.ver";
export const CLIENTES_COBRANZA_EJECUTAR = "clientes.cobranza.ejecutar";

// Pedidos
export const PEDIDOS_VER = "pedidos.ver";
export const PEDIDOS_CREAR = "pedidos.crear";
export const PEDIDOS_EDITAR = "pedidos.editar";
export const PEDIDOS_ELIMINAR = "pedidos.eliminar";

// Inventario
export const INVENTARIO_VER = "inventario.ver";
export const INVENTARIO_CREAR = "inventario.crear";
export const INVENTARIO_EDITAR = "inventario.editar";
export const INVENTARIO_MERCANCIA_DANADA_VER = "inventario.mercancia_danada.ver";
export const INVENTARIO_MERCANCIA_DANADA_REGISTRAR = "inventario.mercancia_danada.registrar";
export const INVENTARIO_LIQUIDACIONES_VER = "inventario.liquidaciones.ver";
export const INVENTARIO_LIQUIDACIONES_CREAR = "inventario.liquidaciones.crear";

// Catálogos
export const CATALOGOS_PRODUCTOS_VER = "catalogos.productos.ver";
export const CATALOGOS_PRODUCTOS_CREAR = "catalogos.productos.crear";
export const CATALOGOS_PRODUCTOS_EDITAR = "catalogos.productos.editar";
export const CATALOGOS_PRODUCTOS_ELIMINAR = "catalogos.productos.eliminar";

export const CATALOGOS_DEPARTAMENTOS_VER = "catalogos.departamentos.ver";
export const CATALOGOS_DEPARTAMENTOS_CREAR = "catalogos.departamentos.crear";
export const CATALOGOS_DEPARTAMENTOS_EDITAR = "catalogos.departamentos.editar";
export const CATALOGOS_DEPARTAMENTOS_ELIMINAR = "catalogos.departamentos.eliminar";

export const CATALOGOS_PROMOCIONES_VER = "catalogos.promociones.ver";
export const CATALOGOS_PROMOCIONES_CREAR = "catalogos.promociones.crear";
export const CATALOGOS_PROMOCIONES_EDITAR = "catalogos.promociones.editar";
export const CATALOGOS_PROMOCIONES_ELIMINAR = "catalogos.promociones.eliminar";

export const CATALOGOS_SUCURSALES_VER = "catalogos.sucursales.ver";
export const CATALOGOS_SUCURSALES_CREAR = "catalogos.sucursales.crear";
export const CATALOGOS_SUCURSALES_EDITAR = "catalogos.sucursales.editar";
export const CATALOGOS_SUCURSALES_ELIMINAR = "catalogos.sucursales.eliminar";

export const CATALOGOS_PROVEEDORES_VER = "catalogos.proveedores.ver";
export const CATALOGOS_PROVEEDORES_CREAR = "catalogos.proveedores.crear";
export const CATALOGOS_PROVEEDORES_EDITAR = "catalogos.proveedores.editar";
export const CATALOGOS_PROVEEDORES_ELIMINAR = "catalogos.proveedores.eliminar";

export const CATALOGOS_USUARIOS_VER = "catalogos.usuarios.ver";
export const CATALOGOS_USUARIOS_CREAR = "catalogos.usuarios.crear";
export const CATALOGOS_USUARIOS_EDITAR = "catalogos.usuarios.editar";
export const CATALOGOS_USUARIOS_ELIMINAR = "catalogos.usuarios.eliminar";

export const CATALOGOS_ROLES_VER = "catalogos.roles.ver";
export const CATALOGOS_ROLES_CREAR = "catalogos.roles.crear";
export const CATALOGOS_ROLES_EDITAR = "catalogos.roles.editar";
export const CATALOGOS_ROLES_ELIMINAR = "catalogos.roles.eliminar";

// Reportes
export const REPORTES_VER = "reportes.ver";
export const REPORTES_GENERAR = "reportes.generar";
export const REPORTES_EXPORTAR = "reportes.exportar";

/**
 * Agrupa todos los permisos por módulo para facilitar la asignación
 */
export const PERMISSIONS_BY_MODULE = {
  solicitudes_credito: [
    SOLICITUDES_CREDITO_VER,
    SOLICITUDES_CREDITO_CREAR,
    SOLICITUDES_CREDITO_EDITAR,
    SOLICITUDES_CREDITO_ELIMINAR,
    SOLICITUDES_CREDITO_APROBAR,
  ],
  cajas: [CAJAS_VER, CAJAS_CREAR, CAJAS_EDITAR, CAJAS_CERRAR],
  clientes: [
    CLIENTES_VER,
    CLIENTES_CREAR,
    CLIENTES_EDITAR,
    CLIENTES_ELIMINAR,
    CLIENTES_MOROSIDAD_VER,
    CLIENTES_COBRANZA_VER,
    CLIENTES_COBRANZA_EJECUTAR,
  ],
  pedidos: [PEDIDOS_VER, PEDIDOS_CREAR, PEDIDOS_EDITAR, PEDIDOS_ELIMINAR],
  inventario: [
    INVENTARIO_VER,
    INVENTARIO_CREAR,
    INVENTARIO_EDITAR,
    INVENTARIO_MERCANCIA_DANADA_VER,
    INVENTARIO_MERCANCIA_DANADA_REGISTRAR,
    INVENTARIO_LIQUIDACIONES_VER,
    INVENTARIO_LIQUIDACIONES_CREAR,
  ],
  catalogos: {
    productos: [
      CATALOGOS_PRODUCTOS_VER,
      CATALOGOS_PRODUCTOS_CREAR,
      CATALOGOS_PRODUCTOS_EDITAR,
      CATALOGOS_PRODUCTOS_ELIMINAR,
    ],
    departamentos: [
      CATALOGOS_DEPARTAMENTOS_VER,
      CATALOGOS_DEPARTAMENTOS_CREAR,
      CATALOGOS_DEPARTAMENTOS_EDITAR,
      CATALOGOS_DEPARTAMENTOS_ELIMINAR,
    ],
    promociones: [
      CATALOGOS_PROMOCIONES_VER,
      CATALOGOS_PROMOCIONES_CREAR,
      CATALOGOS_PROMOCIONES_EDITAR,
      CATALOGOS_PROMOCIONES_ELIMINAR,
    ],
    sucursales: [
      CATALOGOS_SUCURSALES_VER,
      CATALOGOS_SUCURSALES_CREAR,
      CATALOGOS_SUCURSALES_EDITAR,
      CATALOGOS_SUCURSALES_ELIMINAR,
    ],
    proveedores: [
      CATALOGOS_PROVEEDORES_VER,
      CATALOGOS_PROVEEDORES_CREAR,
      CATALOGOS_PROVEEDORES_EDITAR,
      CATALOGOS_PROVEEDORES_ELIMINAR,
    ],
    usuarios: [
      CATALOGOS_USUARIOS_VER,
      CATALOGOS_USUARIOS_CREAR,
      CATALOGOS_USUARIOS_EDITAR,
      CATALOGOS_USUARIOS_ELIMINAR,
    ],
    roles: [
      CATALOGOS_ROLES_VER,
      CATALOGOS_ROLES_CREAR,
      CATALOGOS_ROLES_EDITAR,
      CATALOGOS_ROLES_ELIMINAR,
    ],
  },
  reportes: [REPORTES_VER, REPORTES_GENERAR, REPORTES_EXPORTAR],
};

