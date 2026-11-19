import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Legacy route: devoluciones a proveedor viven en mercancía dañada (pestaña B).
 * El alta «libre» sin folio se puede reintroducir desde esa pantalla si se necesita.
 */
export default function SalidaMercanciaRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/inventario/mercancia-danada");
  }, [router]);

  return null;
}
