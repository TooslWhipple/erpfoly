import { useRouter } from "next/router";
import { CreditApplicationFormPage } from "@/components/CreditApplicationForm";

export default function CreditApplicationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") return null;

  return <CreditApplicationFormPage isCreateMode={false} applicationId={id} />;
}
