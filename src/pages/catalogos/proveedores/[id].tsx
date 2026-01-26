import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Radio, IconButton, InputAdornment, Grid } from "@mui/material";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import {
    MainLayout,
    Breadcrumbs,
    FormTextField,
    FormSelect,
    Tabs,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    BreadcrumbsContainer,
    PageHeader,
    PageTitle,
    SaveButton,
    TabsContainer,
    FormCard,
    SectionTitle,
    SectionDescription,
    Section,
    RadioGroupContainer,
    RadioLabel,
    StyledRadioGroup,
    StyledFormControlLabel,
    DynamicListContainer,
    DynamicListItem,
    DeleteButton,
    DeleteButtonWrapper,
    AddButton,
} from "@/styles/catalogos/proveedores.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SupplierContact {
    id: string;
    position: string;
    name: string;
    phone: string;
}

interface BankAccount {
    id: string;
    bank: string;
    city: string;
    branch: string;
    account: string;
}

interface CreditData {
    attention: string;
    position: string;
    phone: string;
}

interface Promotion {
    id: string;
    description: string;
    percentage: string;
    startDate: string;
    endDate: string;
}

interface Supplier {
    id: number;
    name: string;
    businessName: string;
    rfc: string;
    website: string;
    email: string;
    type: "nacional" | "extranjera";
    paymentTerm: number;
    freight: "pagado" | "cobrar";
    observations?: string;
    contacts: SupplierContact[];
    creditData: CreditData;
    bankAccounts: BankAccount[];
    promotions: Promotion[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const POSITION_OPTIONS = [
    { value: "gerente", label: "Gerente" },
    { value: "agente", label: "Agente" },
    { value: "coordinador", label: "Coordinador" },
    { value: "supervisor", label: "Supervisor" },
    { value: "ejecutivo", label: "Ejecutivo" },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getSupplier(id: number): Promise<Supplier | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate existing supplier data
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

    // Determine if creating or editing
    const isNew = id === "nuevo";
    const supplierId = isNew ? null : Number(id);

    // State
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    // General Data State
    const [name, setName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [rfc, setRfc] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState<"nacional" | "extranjera">("nacional");
    const [paymentTerm, setPaymentTerm] = useState("60");
    const [freight, setFreight] = useState<"pagado" | "cobrar">("pagado");
    const [observations, setObservations] = useState("");

    // Contacts State - Initialize with 2 default contacts
    const [contacts, setContacts] = useState<SupplierContact[]>([
        {
            id: "default-1",
            position: "gerente",
            name: "",
            phone: "",
        },
        {
            id: "default-2",
            position: "agente",
            name: "",
            phone: "",
        },
    ]);

    // Credit Data State
    const [creditAttention, setCreditAttention] = useState("");
    const [creditPosition, setCreditPosition] = useState("");
    const [creditPhone, setCreditPhone] = useState("");
    // Bank Accounts State - Initialize with 1 default account
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
        {
            id: "default-1",
            bank: "",
            city: "",
            branch: "",
            account: "",
        },
    ]);

    // Promotions State - Initialize with 1 default promotion
    const [promotions, setPromotions] = useState<Promotion[]>([
        {
            id: "default-1",
            description: "",
            percentage: "",
            startDate: "",
            endDate: "",
        },
    ]);

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch supplier data if editing
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

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = "El nombre es requerido";
        }

        if (!businessName.trim()) {
            newErrors.businessName = "La razón social es requerida";
        }

        if (!rfc.trim()) {
            newErrors.rfc = "El RFC es requerido";
        } else if (rfc.length < 12 || rfc.length > 13) {
            newErrors.rfc = "El RFC debe tener entre 12 y 13 caracteres";
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "El email tiene un formato inválido";
        }

        if (website && !/^https?:\/\/.+/.test(website)) {
            newErrors.website = "La URL debe comenzar con http:// o https://";
        }

        if (!paymentTerm || Number(paymentTerm) <= 0) {
            newErrors.paymentTerm = "El plazo de pagos debe ser mayor a 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
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

    // Contact handlers
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
        setContacts(contacts.filter((c) => c.id !== contactId));
    };

    const handleContactChange = (
        contactId: string,
        field: keyof SupplierContact,
        value: string
    ) => {
        setContacts(
            contacts.map((c) => (c.id === contactId ? { ...c, [field]: value } : c))
        );
    };

    // Bank account handlers
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
        field: keyof BankAccount,
        value: string
    ) => {
        setBankAccounts(
            bankAccounts.map((a) => (a.id === accountId ? { ...a, [field]: value } : a))
        );
    };

    // Promotion handlers
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
        field: keyof Promotion,
        value: string
    ) => {
        setPromotions(
            promotions.map((p) => (p.id === promotionId ? { ...p, [field]: value } : p))
        );
    };

    // Breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Proveedores", href: "/catalogos/proveedores" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    // Tabs configuration
    const tabs = [
        { value: "general", label: "Datos generales" },
        { value: "contacts", label: "Contactos" },
        { value: "credit", label: "Datos crediticios" },
        { value: "promotions", label: "Promociones" },
    ];

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
            <BreadcrumbsContainer>
                <Breadcrumbs items={breadcrumbItems} />
            </BreadcrumbsContainer>

            <PageHeader>
                <PageTitle>{isNew ? "Nuevo proveedor" : "Editar proveedor"}</PageTitle>
                <SaveButton
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                </SaveButton>
            </PageHeader>

            <TabsContainer>
                <Tabs
                    tabs={tabs}
                    value={activeTab}
                    onChange={setActiveTab}
                    withBorder={true}
                />
            </TabsContainer>

            <FormCard>
                {/* General Data Tab */}
                {activeTab === "general" && (
                    <Section>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <FormTextField
                                    label="Nombre"
                                    placeholder="Ingresa..."
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors({ ...errors, name: "" });
                                    }}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name}
                                    required
                                    autoFocus
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormTextField
                                    label="Razón social"
                                    placeholder="Ingresa..."
                                    value={businessName}
                                    onChange={(e) => {
                                        setBusinessName(e.target.value);
                                        if (errors.businessName)
                                            setErrors({ ...errors, businessName: "" });
                                    }}
                                    error={Boolean(errors.businessName)}
                                    helperText={errors.businessName}
                                    required
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormTextField
                                    label="RFC"
                                    placeholder="Ingresa..."
                                    value={rfc}
                                    onChange={(e) => {
                                        setRfc(e.target.value.toUpperCase());
                                        if (errors.rfc) setErrors({ ...errors, rfc: "" });
                                    }}
                                    error={Boolean(errors.rfc)}
                                    helperText={errors.rfc}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormTextField
                                    label="Página web"
                                    placeholder="Ingresa..."
                                    value={website}
                                    onChange={(e) => {
                                        setWebsite(e.target.value);
                                        if (errors.website)
                                            setErrors({ ...errors, website: "" });
                                    }}
                                    error={Boolean(errors.website)}
                                    helperText={errors.website}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <FormTextField
                                    label="Email"
                                    placeholder="Ingresa..."
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: "" });
                                    }}
                                    error={Boolean(errors.email)}
                                    helperText={errors.email}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <RadioGroupContainer>
                                    <RadioLabel>Tipo:</RadioLabel>
                                    <StyledRadioGroup
                                        value={type}
                                        onChange={(e) =>
                                            setType(e.target.value as "nacional" | "extranjera")
                                        }
                                    >
                                        <StyledFormControlLabel
                                            value="nacional"
                                            control={<Radio size="small" />}
                                            label="Nacional"
                                        />
                                        <StyledFormControlLabel
                                            value="extranjera"
                                            control={<Radio size="small" />}
                                            label="Extranjera"
                                        />
                                    </StyledRadioGroup>
                                </RadioGroupContainer>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <FormTextField
                                    label="Plazo de pagos (días)"
                                    placeholder="Ingresa..."
                                    type="number"
                                    value={paymentTerm}
                                    onChange={(e) => {
                                        setPaymentTerm(e.target.value);
                                        if (errors.paymentTerm)
                                            setErrors({ ...errors, paymentTerm: "" });
                                    }}
                                    error={Boolean(errors.paymentTerm)}
                                    helperText={errors.paymentTerm}
                                    required
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <RadioGroupContainer>
                                    <RadioLabel>Flete:</RadioLabel>
                                    <StyledRadioGroup
                                        value={freight}
                                        onChange={(e) =>
                                            setFreight(e.target.value as "pagado" | "cobrar")
                                        }
                                    >
                                        <StyledFormControlLabel
                                            value="pagado"
                                            control={<Radio size="small" />}
                                            label="Pagado"
                                        />
                                        <StyledFormControlLabel
                                            value="cobrar"
                                            control={<Radio size="small" />}
                                            label="Cobrar"
                                        />
                                    </StyledRadioGroup>
                                </RadioGroupContainer>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <FormTextField
                                    label="Observaciones"
                                    placeholder="Ingresa observaciones..."
                                    value={observations}
                                    onChange={(e) => {
                                        setObservations(e.target.value);
                                        if (errors.observations) setErrors({ ...errors, observations: "" });
                                    }}
                                    error={Boolean(errors.observations)}
                                    helperText={errors.observations}
                                    multiline
                                    rows={4}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Section>
                )}

                {/* Contacts Tab */}
                {activeTab === "contacts" && (
                    <Section>
                        <DynamicListContainer>
                            {contacts.map((contact) => (
                                <DynamicListItem key={contact.id}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, md: 'grow' }}>
                                            <FormSelect
                                                label="Cargo"
                                                placeholder="Selecciona..."
                                                value={contact.position}
                                                onChange={(e) =>
                                                    handleContactChange(
                                                        contact.id,
                                                        "position",
                                                        String(e.target.value)
                                                    )
                                                }
                                                options={POSITION_OPTIONS}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 'grow' }}>
                                            <FormTextField
                                                label="Nombre"
                                                placeholder="Ingresa"
                                                value={contact.name}
                                                onChange={(e) =>
                                                    handleContactChange(
                                                        contact.id,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 'grow' }}>
                                            <FormTextField
                                                label="Número"
                                                placeholder="Ingresa"
                                                type="tel"
                                                value={contact.phone}
                                                onChange={(e) =>
                                                    handleContactChange(
                                                        contact.id,
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid sx={{ display: { xs: "none", sm: "block" } }}>
                                            <DeleteButton
                                                size="small"
                                                onClick={() => handleRemoveContact(contact.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </DeleteButton>
                                        </Grid>
                                        <DeleteButtonWrapper>
                                            <DeleteButton
                                                size="small"
                                                onClick={() => handleRemoveContact(contact.id)}
                                                sx={{ display: { xs: "block", sm: "none" } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </DeleteButton>
                                        </DeleteButtonWrapper>
                                    </Grid>
                                </DynamicListItem>
                            ))}
                        </DynamicListContainer>
                        <AddButton
                            variant="text"
                            startIcon={<AddIcon />}
                            onClick={handleAddContact}
                        >
                            Agregar otro
                        </AddButton>
                    </Section>
                )}

                {/* Credit Data Tab */}
                {activeTab === "credit" && (
                    <>
                        <Section>
                            <SectionTitle>Crédito y cobranza</SectionTitle>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormTextField
                                        label="Atención"
                                        placeholder="Ingresar"
                                        value={creditAttention}
                                        onChange={(e) => setCreditAttention(e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormTextField
                                        label="Puesto"
                                        placeholder="Ingresar"
                                        value={creditPosition}
                                        onChange={(e) => setCreditPosition(e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormTextField
                                        label="Número"
                                        placeholder="Ingresar"
                                        type="tel"
                                        value={creditPhone}
                                        onChange={(e) => setCreditPhone(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Section>

                        <Section>
                            <SectionTitle>Cuentas bancarias</SectionTitle>
                            <DynamicListContainer>
                                {bankAccounts.map((account) => (
                                    <DynamicListItem key={account.id}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                                <FormTextField
                                                    label="Banco"
                                                    placeholder="Ingresar"
                                                    value={account.bank}
                                                    onChange={(e) =>
                                                        handleBankAccountChange(
                                                            account.id,
                                                            "bank",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                                <FormTextField
                                                    label="Plaza"
                                                    placeholder="Ingresar"
                                                    value={account.city}
                                                    onChange={(e) =>
                                                        handleBankAccountChange(
                                                            account.id,
                                                            "city",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                                <FormTextField
                                                    label="Sucursal"
                                                    placeholder="Ingresar"
                                                    value={account.branch}
                                                    onChange={(e) =>
                                                        handleBankAccountChange(
                                                            account.id,
                                                            "branch",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                                <FormTextField
                                                    label="Cuenta"
                                                    placeholder="Ingresar"
                                                    value={account.account}
                                                    onChange={(e) =>
                                                        handleBankAccountChange(
                                                            account.id,
                                                            "account",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid sx={{ display: { xs: "none", sm: "block" } }}>
                                                <DeleteButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleRemoveBankAccount(account.id)
                                                    }
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </DeleteButton>
                                            </Grid>
                                            <DeleteButtonWrapper>
                                                <DeleteButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleRemoveBankAccount(account.id)
                                                    }
                                                    sx={{ display: { xs: "block", sm: "none" } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </DeleteButton>
                                            </DeleteButtonWrapper>
                                        </Grid>
                                    </DynamicListItem>
                                ))}
                            </DynamicListContainer>
                            <AddButton
                                variant="text"
                                startIcon={<AddIcon />}
                                onClick={handleAddBankAccount}
                            >
                                Agregar otra
                            </AddButton>
                        </Section>
                    </>
                )}

                {/* Promotions Tab */}
                {activeTab === "promotions" && (
                    <Section>
                        <SectionTitle>Promociones</SectionTitle>
                        <SectionDescription>
                            Estos son Promociones generales del proveedor y se aplicarán a
                            todos los productos del mismo.
                        </SectionDescription>
                        <DynamicListContainer>
                            {promotions.map((promotion) => (
                                <DynamicListItem key={promotion.id}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                            <FormTextField
                                                label="Promoción"
                                                placeholder="Ingrese la descripción de la promoción"
                                                value={promotion.description}
                                                onChange={(e) =>
                                                    handlePromotionChange(
                                                        promotion.id,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                            <FormTextField
                                                label="Porcentaje (%)"
                                                placeholder="0.00"
                                                type="number"
                                                value={promotion.percentage}
                                                onChange={(e) =>
                                                    handlePromotionChange(
                                                        promotion.id,
                                                        "percentage",
                                                        e.target.value
                                                    )
                                                }
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">%</InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                            <FormTextField
                                                label="Fecha inicio"
                                                type="date"
                                                value={promotion.startDate}
                                                onChange={(e) =>
                                                    handlePromotionChange(
                                                        promotion.id,
                                                        "startDate",
                                                        e.target.value
                                                    )
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                                            <FormTextField
                                                label="Fecha fin"
                                                type="date"
                                                value={promotion.endDate}
                                                onChange={(e) =>
                                                    handlePromotionChange(
                                                        promotion.id,
                                                        "endDate",
                                                        e.target.value
                                                    )
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                        <Grid sx={{ display: { xs: "none", sm: "block" } }}>
                                            <DeleteButton
                                                size="small"
                                                onClick={() => handleRemovePromotion(promotion.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </DeleteButton>
                                        </Grid>
                                        <DeleteButtonWrapper>
                                            <DeleteButton
                                                size="small"
                                                onClick={() => handleRemovePromotion(promotion.id)}
                                                sx={{ display: { xs: "block", sm: "none" } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </DeleteButton>
                                        </DeleteButtonWrapper>
                                    </Grid>
                                </DynamicListItem>
                            ))}
                        </DynamicListContainer>
                        <AddButton
                            variant="text"
                            startIcon={<AddIcon />}
                            onClick={handleAddPromotion}
                        >
                            Agregar otro
                        </AddButton>
                    </Section>
                )}
            </FormCard>
        </MainLayout>
    );
}
