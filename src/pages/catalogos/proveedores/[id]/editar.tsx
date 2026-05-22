import { CircularProgress, Stack } from "@mui/material";
import { MainLayout, Breadcrumbs, Title, TabFilters } from "@/components";
import { GeneralTab, ContactsTab, CreditTab, PromotionsTab } from "@/components/Proveedores";
import { useSupplierForm } from "@/hooks/proveedores";
import { CATALOG_SUPPLIERS_CREATE, CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";

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
        promotions,
        jobTitleOptions,
        activeTab,
        setActiveTab,
        saving,
        handleSave,
        handleGeneralFieldChange,
        handleAddContact,
        handleRemoveContact,
        handleContactChange,
        handleCreditDataChange,
        handleAddBankAccount,
        handleRemoveBankAccount,
        handleBankAccountChange,
        handleAddPromotion,
        handleRemovePromotion,
        handlePromotionChange,
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
                    ]}
                />

                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {
                    activeTab === "general" && (
                        <GeneralTab
                            values={generalFormValues}
                            errors={errors}
                            onFieldChange={handleGeneralFieldChange}
                        />
                    )
                }
                {
                    activeTab === "contacts" && (
                        <ContactsTab
                            contacts={contacts}
                            jobTitleOptions={jobTitleOptions}
                            onAddContact={handleAddContact}
                            onRemoveContact={handleRemoveContact}
                            onContactChange={handleContactChange}
                        />
                    )
                }
                {
                    activeTab === "credit" && (
                        <CreditTab
                            creditData={creditData}
                            bankAccounts={bankAccounts}
                            jobTitleOptions={jobTitleOptions}
                            onCreditDataChange={handleCreditDataChange}
                            onAddBankAccount={handleAddBankAccount}
                            onRemoveBankAccount={handleRemoveBankAccount}
                            onBankAccountChange={handleBankAccountChange}
                        />
                    )
                }
                {
                    activeTab === "promotions" && (
                        <PromotionsTab
                            promotions={promotions}
                            onAddPromotion={handleAddPromotion}
                            onRemovePromotion={handleRemovePromotion}
                            onPromotionChange={handlePromotionChange}
                        />
                    )
                }
            </Stack>
        </MainLayout>
    );
}
