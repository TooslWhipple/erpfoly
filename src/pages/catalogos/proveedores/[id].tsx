import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Stack } from "@mui/material";
import { MainLayout, Breadcrumbs, Title, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { FormCard } from "@/styles/catalogos/proveedores.styles";
import type { Supplier, GeneralFormValues } from "./types";
import { GeneralTab } from "./GeneralTab";
import { ContactsTab } from "./ContactsTab";
import { CreditTab } from "./CreditTab";
import { PromotionsTab } from "./PromotionsTab";

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getSupplier(id: number): Promise<Supplier | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (id === 1) {
        return {
            id: 1,
            name: "Arlix Muebles y Electrodomésticos",
            businessName: "Arlix Muebles y Electrodomésticos S.A. de C.V.",
            rfc: "AME850101ABC",
            website: "https://www.arlix.com.mx",
            email: "contacto@arlix.com.mx",
            type: "nacional",
            paymentTerm: 60,
            freight: "pagado",
            contacts: [
                {
                    id: "1",
                    position: "gerente",
                    name: "Juan Pérez",
                    phone: "8331234567",
                },
            ],
            creditData: {
                attention: "María González",
                position: "Gerente de Crédito",
                phone: "8331234567",
            },
            bankAccounts: [
                {
                    id: "1",
                    bank: "Banco Santander",
                    city: "Tampico",
                    branch: "001",
                    account: "123456789012345678",
                },
            ],
            promotions: [],
        };
    }

    return null;
}

async function saveSupplier(
    supplier: Omit<Supplier, "id"> & { id?: number }
): Promise<Supplier> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const savedSupplier: Supplier = {
        id: supplier.id || Date.now(),
        name: supplier.name,
        businessName: supplier.businessName,
        rfc: supplier.rfc,
        website: supplier.website,
        email: supplier.email,
        type: supplier.type,
        paymentTerm: supplier.paymentTerm,
        freight: supplier.freight,
        observations: supplier.observations,
        contacts: supplier.contacts,
        creditData: supplier.creditData,
        bankAccounts: supplier.bankAccounts,
        promotions: supplier.promotions,
    };
    console.log("[API] Saved supplier:", savedSupplier);
    return savedSupplier;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SupplierFormPage() {
    const router = useRouter();
    const { id } = router.query;

    const isNew = id === "nuevo";
    const supplierId = isNew ? null : Number(id);

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // General data
    const [name, setName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [rfc, setRfc] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState<"nacional" | "extranjera">("nacional");
    const [paymentTerm, setPaymentTerm] = useState("60");
    const [freight, setFreight] = useState<"pagado" | "cobrar">("pagado");
    const [observations, setObservations] = useState("");

    // Contacts
    const [contacts, setContacts] = useState<Supplier["contacts"]>([
        { id: "default-1", position: "gerente", name: "", phone: "" },
        { id: "default-2", position: "agente", name: "", phone: "" },
    ]);

    // Credit
    const [creditAttention, setCreditAttention] = useState("");
    const [creditPosition, setCreditPosition] = useState("");
    const [creditPhone, setCreditPhone] = useState("");
    const [bankAccounts, setBankAccounts] = useState<Supplier["bankAccounts"]>([
        { id: "default-1", bank: "", city: "", branch: "", account: "" },
    ]);

    // Promotions
    const [promotions, setPromotions] = useState<Supplier["promotions"]>([
        {
            id: "default-1",
            description: "",
            percentage: "",
            startDate: "",
            endDate: "",
        },
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isNew || !supplierId) {
            setLoading(false);
            return;
        }

        async function loadSupplier() {
            setLoading(true);
            try {
                const supplier = await getSupplier(supplierId!);
                if (supplier) {
                    setName(supplier.name);
                    setBusinessName(supplier.businessName);
                    setRfc(supplier.rfc);
                    setWebsite(supplier.website);
                    setEmail(supplier.email);
                    setType(supplier.type);
                    setPaymentTerm(supplier.paymentTerm.toString());
                    setFreight(supplier.freight);
                    setObservations(supplier.observations || "");
                    setContacts(supplier.contacts);
                    setCreditAttention(supplier.creditData.attention);
                    setCreditPosition(supplier.creditData.position);
                    setCreditPhone(supplier.creditData.phone);
                    setBankAccounts(supplier.bankAccounts);
                    setPromotions(supplier.promotions);
                }
            } catch (err) {
                console.error("[SupplierForm] Error loading supplier:", err);
            } finally {
                setLoading(false);
            }
        }

        loadSupplier();
    }, [isNew, supplierId]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = "El nombre es requerido";
        if (!businessName.trim())
            newErrors.businessName = "La razón social es requerida";
        if (!rfc.trim()) newErrors.rfc = "El RFC es requerido";
        else if (rfc.length < 12 || rfc.length > 13)
            newErrors.rfc = "El RFC debe tener entre 12 y 13 caracteres";
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            newErrors.email = "El email tiene un formato inválido";
        if (website && !/^https?:\/\/.+/.test(website))
            newErrors.website = "La URL debe comenzar con http:// o https://";
        if (!paymentTerm || Number(paymentTerm) <= 0)
            newErrors.paymentTerm = "El plazo de pagos debe ser mayor a 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setActiveTab("general");
            return;
        }

        setSaving(true);
        try {
            await saveSupplier({
                id: supplierId || undefined,
                name: name.trim(),
                businessName: businessName.trim(),
                rfc: rfc.trim().toUpperCase(),
                website: website.trim(),
                email: email.trim(),
                type,
                paymentTerm: Number(paymentTerm),
                freight,
                observations: observations.trim(),
                contacts,
                creditData: {
                    attention: creditAttention.trim(),
                    position: creditPosition.trim(),
                    phone: creditPhone.trim(),
                },
                bankAccounts,
                promotions,
            });
            router.push("/catalogos/proveedores");
        } catch (err) {
            console.error("[SupplierForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleGeneralFieldChange = (
        field: keyof GeneralFormValues,
        value: string
    ) => {
        const setters: Record<
            keyof GeneralFormValues,
            (v: string) => void
        > = {
            name: setName,
            businessName: setBusinessName,
            rfc: setRfc,
            website: setWebsite,
            email: setEmail,
            type: (v) => setType(v as "nacional" | "extranjera"),
            paymentTerm: setPaymentTerm,
            freight: (v) => setFreight(v as "pagado" | "cobrar"),
            observations: setObservations,
        };
        setters[field](value);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleAddContact = () => {
        setContacts([
            ...contacts,
            {
                id: Date.now().toString(),
                position: "",
                name: "",
                phone: "",
            },
        ]);
    };

    const handleRemoveContact = (contactId: string) => {
        const index = contacts.findIndex((c) => c.id === contactId);
        if (index <= 1) return; // First two contacts are required and cannot be removed
        setContacts(contacts.filter((c) => c.id !== contactId));
    };

    const handleContactChange = (
        contactId: string,
        field: keyof (typeof contacts)[0],
        value: string
    ) => {
        setContacts(
            contacts.map((c) =>
                c.id === contactId ? { ...c, [field]: value } : c
            )
        );
    };

    const handleAddBankAccount = () => {
        setBankAccounts([
            ...bankAccounts,
            {
                id: Date.now().toString(),
                bank: "",
                city: "",
                branch: "",
                account: "",
            },
        ]);
    };

    const handleRemoveBankAccount = (accountId: string) => {
        setBankAccounts(bankAccounts.filter((a) => a.id !== accountId));
    };

    const handleBankAccountChange = (
        accountId: string,
        field: keyof (typeof bankAccounts)[0],
        value: string
    ) => {
        setBankAccounts(
            bankAccounts.map((a) =>
                a.id === accountId ? { ...a, [field]: value } : a
            )
        );
    };

    const handleAddPromotion = () => {
        setPromotions([
            ...promotions,
            {
                id: Date.now().toString(),
                description: "",
                percentage: "0.00",
                startDate: "",
                endDate: "",
            },
        ]);
    };

    const handleRemovePromotion = (promotionId: string) => {
        setPromotions(promotions.filter((p) => p.id !== promotionId));
    };

    const handlePromotionChange = (
        promotionId: string,
        field: keyof (typeof promotions)[0],
        value: string
    ) => {
        setPromotions(
            promotions.map((p) =>
                p.id === promotionId ? { ...p, [field]: value } : p
            )
        );
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Proveedores", href: "/catalogos/proveedores" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    const tabs = [
        { value: "general", label: "Datos generales" },
        { value: "contacts", label: "Contactos" },
        { value: "credit", label: "Datos crediticios" },
        { value: "promotions", label: "Promociones" },
    ];

    const generalFormValues: GeneralFormValues = {
        name,
        businessName,
        rfc,
        website,
        email,
        type,
        paymentTerm,
        freight,
        observations,
    };

    if (loading) {
        return (
            <MainLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 400,
                    }}
                >
                    <CircularProgress />
                </Box>
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
                        onAddContact={handleAddContact}
                        onRemoveContact={handleRemoveContact}
                        onContactChange={handleContactChange}
                    />
                )}
                {activeTab === "credit" && (
                    <CreditTab
                        creditData={{
                            attention: creditAttention,
                            position: creditPosition,
                            phone: creditPhone,
                        }}
                        bankAccounts={bankAccounts}
                        onCreditDataChange={(field, value) => {
                            if (field === "attention") setCreditAttention(value);
                            if (field === "position") setCreditPosition(value);
                            if (field === "phone") setCreditPhone(value);
                        }}
                        onAddBankAccount={handleAddBankAccount}
                        onRemoveBankAccount={handleRemoveBankAccount}
                        onBankAccountChange={handleBankAccountChange}
                    />
                )}
                {activeTab === "promotions" && (
                    <PromotionsTab
                        promotions={promotions}
                        onAddPromotion={handleAddPromotion}
                        onRemovePromotion={handleRemovePromotion}
                        onPromotionChange={handlePromotionChange}
                    />
                )}
            </Stack>
        </MainLayout>
    );
}
