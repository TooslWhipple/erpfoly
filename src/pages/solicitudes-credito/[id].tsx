import { useRouter } from "next/router";
import { CreditApplicationEditorPage } from "@/components/CreditApplicationForm";

export default function CreditApplicationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") return null;

  return <CreditApplicationEditorPage isCreateMode={false} applicationId={id} />;
}
