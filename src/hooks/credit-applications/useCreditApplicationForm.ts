import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getCreditApplicationBasicInformation, saveCreditApplication } from "@/services/creditApplications.service";
import { useBasicInformationTab } from "./tabs/useBasicInformationTab";
import { useCreditApplicationDraftStore } from "@/store/useCreditApplicationDraftStore";
import type {
  BasicInformationFormValues,
  CreditApplicationBiometricsData,
  CreditApplicationTabId,
} from "@/types/credit-application-form.types";

const TAB_LIST: { label: string; value: CreditApplicationTabId }[] = [
  { label: "Información básica", value: "basic-information" },
];

const EMPTY_BASIC_INFORMATION_VALUES: BasicInformationFormValues = {
  firstName: "",
  lastName: "",
  secondLastName: "",
  birthDate: "",
  maritalStatus: "",
  curp: "",
  rfc: "",
  email: "",
  whatsappNumber: "",
  securityCode: "",
};

interface UseCreditApplicationFormParams {
  applicationId?: string;
  isCreateMode: boolean;
}

export function useCreditApplicationForm({ applicationId, isCreateMode }: UseCreditApplicationFormParams) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [activeTab, setActiveTab] = useState<CreditApplicationTabId>("basic-information");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [biometricsData, setBiometricsData] = useState<CreditApplicationBiometricsData | null>(null);

  const upsertBasicInformation = useCreditApplicationDraftStore((state) => state.upsertBasicInformation);
  const upsertBiometrics = useCreditApplicationDraftStore((state) => state.upsertBiometrics);
  const getDraftById = useCreditApplicationDraftStore((state) => state.getDraftById);

  const draftKey = useMemo(() => {
    if (isCreateMode) return "new-credit-application";
    return applicationId ?? "unknown-credit-application";
  }, [applicationId, isCreateMode]);

  const basicInformationTab = useBasicInformationTab(EMPTY_BASIC_INFORMATION_VALUES);
  const setBasicInformationValuesFromExternal = basicInformationTab.setValuesFromExternalSource;

  useEffect(() => {
    if (!isCreateMode && !applicationId) {
      setError("No se encontró el identificador de la solicitud.");
      setLoading(false);
      return;
    }

    const draft = getDraftById(draftKey);
    if (draft) {
      setBasicInformationValuesFromExternal(draft.basicInformation);
      setBiometricsData(draft.biometrics);
      setLoading(false);
      return;
    }

    if (isCreateMode) {
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const loadExistingApplication = async () => {
      setLoading(true);
      setError(null);
      setIsEmptyState(false);

      try {
        const basicInformation = await getCreditApplicationBasicInformation(applicationId!);
        if (isCancelled) return;

        if (!basicInformation) {
          setIsEmptyState(true);
          return;
        }

        setBasicInformationValuesFromExternal(basicInformation);
        upsertBasicInformation(draftKey, basicInformation);
      } catch (loadError) {
        console.error("[CreditApplicationForm] Unable to load credit application", loadError);
        if (!isCancelled) {
          setError("No se pudo cargar la solicitud, intenta nuevamente.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadExistingApplication();

    return () => {
      isCancelled = true;
    };
  }, [
    applicationId,
    draftKey,
    getDraftById,
    isCreateMode,
    setBasicInformationValuesFromExternal,
    upsertBasicInformation,
  ]);

  const persistBasicInformation = useCallback(
    (values: BasicInformationFormValues) => {
      upsertBasicInformation(draftKey, values);
      setSaveSuccess(false);
    },
    [draftKey, upsertBasicInformation]
  );

  const handleBiometricsCompleted = useCallback(
    (biometrics: CreditApplicationBiometricsData) => {
      setBiometricsData(biometrics);
      upsertBiometrics(draftKey, biometrics);
    },
    [draftKey, upsertBiometrics]
  );

  const handleSave = useCallback(async () => {
    const formIsValid = basicInformationTab.validateValues();
    if (!formIsValid) return false;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const result = await saveCreditApplication({
        id: isCreateMode ? undefined : applicationId,
        basicInformation: basicInformationTab.values,
        biometrics: biometricsData,
      });

      persistBasicInformation(basicInformationTab.values);
      setSaveSuccess(true);

      if (isCreateMode && result.id) {
        router.replace(`/solicitudes-credito/${result.id}`);
      }

      return true;
    } catch (saveError) {
      console.error("[CreditApplicationForm] Unable to save credit application", saveError);
      setError("No se pudo guardar la solicitud.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    applicationId,
    basicInformationTab,
    biometricsData,
    isCreateMode,
    persistBasicInformation,
    router,
  ]);

  return {
    loading,
    saving,
    error,
    saveSuccess,
    isEmptyState,
    activeTab,
    tabs: TAB_LIST,
    biometricsData,
    setActiveTab,
    basicInformationTab,
    persistBasicInformation,
    handleSave,
    handleBiometricsCompleted,
  };
}
