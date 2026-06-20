import { CircularProgress, Stack } from "@mui/material";
import { MainLayout, Breadcrumbs, Title, TabFilters } from "@/components";
import { GeneralTab, ContactsTab, CreditTab } from "@/components/Proveedores";
import { useSupplierForm } from "@/hooks/proveedores";
import { CATALOG_SUPPLIERS_CREATE, CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";
import { Mail, PencilIcon } from "lucide-react";

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
        handleEdit,
        handleInvite,
        hasUser
    } = useSupplierForm();

    if (showLoader) {
        return (
            <MainLayout>
                <Stack alignItems="center" justifyContent="center" minHeight={400}>
                    <CircularProgress />
                </Stack>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
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
                            permission: isNew ? CATALOG_SUPPLIERS_CREATE : CATALOG_SUPPLIERS_UPDATE,
                        },
                        {
                            id: "edit",
                            label: "Editar",
                            icon: <PencilIcon size={16} />,
                            onClick: handleEdit,
                            variant: "outlined",
                            permission: CATALOG_SUPPLIERS_UPDATE,
                        },
                       
                                {
                                    id: "invite",
                                    label: inviting ? "Enviando..." : "Enviar invitación",
                                    onClick: handleInvite,
                                    disabled: inviting,
                                    icon: <Mail size={16} />,
                                    variant: "outlined" as const,
                                    color: "primary" as const,
                                    permission: CATALOG_SUPPLIERS_UPDATE,
                                },
                    ]}
                />

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
        </MainLayout>
    );
}
