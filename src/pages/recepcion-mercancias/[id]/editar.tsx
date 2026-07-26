import { useRouter } from "next/router";
import { ReceptionForm } from "@/components/ReceptionForm";

export default function EditarRecepcion() {
  const router = useRouter();
  const id = router.isReady ? Number(router.query.id) : null;

  if (!router.isReady) {
    return null;
  }

  if (id == null || Number.isNaN(id)) {
    if (typeof window !== "undefined") {
      router.replace("/recepcion-mercancias");
    }
    return null;
  }

  return (
    <ReceptionForm
      mode="edit"
      receptionId={id}
      onSaved={(savedId) => {
        router.push(`/recepcion-mercancias/${savedId}`);
      }}
    />
  );
}
