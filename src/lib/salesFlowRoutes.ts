/** Routes that use POS chrome (drawer until `lg`, compact layout, inline menu). */
export function isSalesFlowRoute(pathname: string): boolean {
  // Next.js `pathname` uses route patterns (`/ventas/[id]`), not resolved URLs.
  return (
    pathname === "/ventas/nueva" ||
    pathname === "/ventas/[id]" ||
    pathname === "/cotizaciones/[id]" ||
    pathname === "/cajas" ||
    pathname === "/cajas/busqueda" ||
    pathname === "/cajas/historial" ||
    pathname === "/solicitudes-descuento/[id]"
  );
}
