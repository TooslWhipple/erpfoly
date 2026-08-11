import { CircularProgress, Stack } from "@mui/material";
import { Breadcrumbs, Title, TabFilters } from "@/components";
import { GeneralTab, ContactsTab, CreditTab } from "@/components/Proveedores";
import { useSupplierForm } from "@/hooks/proveedores";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import {
  CATALOG_SUPPLIERS_CREATE,
  CATALOG_SUPPLIERS_UPDATE,
} from "@/lib/permissions";
import { Mail } from "lucide-react";
export default function SupplierEditPage() {
  const {
    isNew,
    showLoader,
    breadcrumbItems,
    tabs,
    generalFormValues,
    errors,
    contacts,
    creditData,
    bankAccounts,
    jobTitleOptions,
    activeTab,
    setActiveTab,
    saving,
    inviting,
    handleSave,
    handleGeneralFieldChange,
    handleAddContact,
    handleRemoveContact,
    handleContactChange,
    handleCreditDataChange,
    handleAddBankAccount,
    handleRemoveBankAccount,
    handleBankAccountChange,
    handleInvite,
    portalStatus,
    inviteUrl,
    inviteExpiresAt,
  } = useSupplierForm();
  const { requestConfirmation, confirmationModal } = useConfirmationModal();

  const handleInviteClick = () => {
    if (portalStatus === "ACTIVE") {
      requestConfirmation({
        title: "Regenerar acceso al portal",
        type: "warning",
        confirmLabel: "Regenerar acceso",
        cancelLabel: "Cancelar",
        description:
          "Este proveedor ya tiene acceso activo al portal. Regenerar la invitación invalidará su contraseña actual y deberá fijar una nueva.",
        onConfirm: () => handleInvite(true),
      });
      return;
    }
    handleInvite(false);
  };
  if (showLoader) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={400}>
        <CircularProgress />
      </Stack>
    );
  }
  return (
    <Stack spacing={2}>
      <Breadcrumbs items={breadcrumbItems} />
      <Title
        title={isNew ? "Nuevo proveedor" : "Editar proveedor"}
        actions={[
          {
            id: "save",
            label: "Guardar",
            onClick: handleSave,
            disabled: saving,
            permission: isNew
              ? CATALOG_SUPPLIERS_CREATE
              : CATALOG_SUPPLIERS_UPDATE,
          },
          {
            id: "invite",
            label: inviting
              ? "Enviando..."
              : portalStatus === "ACTIVE"
                ? "Regenerar acceso"
                : "Enviar invitación",
            onClick: handleInviteClick,
            disabled: inviting,
            icon: <Mail size={16} />,
            variant: "outlined" as const,
            color: "primary" as const,
            permission: CATALOG_SUPPLIERS_UPDATE,
          },
        ]}
      />
      {confirmationModal}

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "general" && (
        <GeneralTab
          values={generalFormValues}
          errors={errors}
          onFieldChange={handleGeneralFieldChange}
          portalStatus={portalStatus}
          inviteUrl={inviteUrl}
          inviteExpiresAt={inviteExpiresAt}
        />
      )}
      {activeTab === "contacts" && (
        <ContactsTab
          contacts={contacts}
          jobTitleOptions={jobTitleOptions}
          errors={errors}
          onAddContact={handleAddContact}
          onRemoveContact={handleRemoveContact}
          onContactChange={handleContactChange}
        />
      )}
      {activeTab === "credit" && (
        <CreditTab
          creditData={creditData}
          bankAccounts={bankAccounts}
          jobTitleOptions={jobTitleOptions}
          errors={errors}
          onCreditDataChange={handleCreditDataChange}
          onAddBankAccount={handleAddBankAccount}
          onRemoveBankAccount={handleRemoveBankAccount}
          onBankAccountChange={handleBankAccountChange}
        />
      )}
    </Stack>
  );
}
