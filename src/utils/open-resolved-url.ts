/**
 * Abre en otra pestaña una URL que hay que pedir antes (p. ej. una URL firmada).
 * La pestaña se abre en el mismo clic, antes del `await`, para que el
 * bloqueador de ventanas emergentes no la descarte; si la URL falla, se cierra
 * y el error se propaga.
 */
export async function openResolvedUrlInNewTab(resolveUrl: () => Promise<string>): Promise<void> {
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;
  try {
    const url = await resolveUrl();
    if (tab) {
      tab.location.replace(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (error) {
    tab?.close();
    throw error;
  }
}
