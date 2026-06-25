// ============================================================================
// Mock data - Credit application detail (read-only module)
// ============================================================================

import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";

const DOCUMENT_THUMB = "https://placehold.co/80x50/f0f0f0/666?text=INE";
const DOCUMENT_FULL = "https://placehold.co/600x400/e8e8e8/333?text=INE+Frontal";
const PHOTO_THUMB = "https://placehold.co/48x48/cce5ff/2663eb?text=Photo";
const SOFA_IMAGE = "https://placehold.co/80x80/e8dcc8/5c4a32?text=Sofa";

export const MOCK_CREDIT_APPLICATION_DETAIL: CreditApplicationDetail = {
  id: 2241,
  status: "SUBMITTED",
  approvedClientId: null,
  approvedBaseCreditLineAmount: null,
  riskScore: 67,
  riskLevel: "medium",
  basicInfo: {
    firstName: "Saúl Arturo",
    firstSurname: "Quintero",
    secondSurname: "Solís",
    birthDate: "15 / Enero / 1995",
    maritalStatus: "Casado (a)",
    curp: "MOMJ113003TY5",
    rfc: "MOMJ113003TY5",
    email: "saul@mail.com",
    whatsapp: "667 123 4567",
    whatsappValidated: true,
  },
  address: {
    postalCode: "80000",
    neighborhood: {
      code: "0001",
      fullCode: "280010001",
      name: "Centro",
      state: "Tamaulipas",
      municipality: "Tampico",
    },
    streetAndNumber: "Calle Merida 1235",
    betweenStreets: "Universidad y Maestros Ilustres",
    housingOwnership: "own",
    timeAtAddress: "5 años",
    previousAddress: "Circuito Villas 1234, Villas del Rio, Culiacán, Sinaloa",
    previousTime: "10 años",
  },
  family: {
    hasSpouse: true,
    spouseName: "María Luisa Ontiveros Huerta",
    spousePhone: "667 123 4567",
    numberOfDependents: 2,
  },
  employment: {
    totalMonthlyIncome: "$38,000.00/mes",
    hasOtherIncome: false,
    applicant: {
      company: "Whipple Studio",
      postalCode: "80000",
      state: "Sinaloa",
      city: "Culiacán",
      streetAndNumber: "Av. Alvaro Obregón 1235",
      tenureYears: 7,
      position: "Gerente Sistemas",
      department: "Sistemas",
      monthlyIncome: "38,000.00",
      companyPhone: "667 123 4567",
    },
    spouse: {
      company: "Estudio Creativo Punto Norte",
      postalCode: "80000",
      state: "Sinaloa",
      city: "Culiacán",
      streetAndNumber: "Av. Pedro Infante 5566",
      tenureYears: 2,
      position: "Director Creativo",
      department: "Marketing",
      monthlyIncome: "36,000.00",
      companyPhone: "667 123 4567",
    },
  },
  references: {
    work: {
      company: "Whipple Studio",
      phone: "667 123 4567",
      clientPosition: "Dirección",
      tenureYears: 12,
      contactNameAndPosition: "Mauricio Estrada",
    },
    family: [
      {
        name: "María de la Luz Jimenez",
        relationship: "Madre",
        address: "Calle del Pino 3142, Colonia Centro",
        phone: "667 123 4567",
      },
      {
        name: "Armando Sotelo",
        relationship: "Hermano",
        address: "Circuito Viñas 1235, Las Viñas Etapa 5, Viñas Residencial",
        phone: "667 123 4567",
      },
    ],
  },
  documentation: {
    documents: [
      {
        id: "doc-1",
        name: "INE (Frontal)",
        verifiedBy: "veriff Capturado y verificado por Veriff",
        thumbnailUrl: DOCUMENT_THUMB,
        fullImageUrl: DOCUMENT_FULL,
      },
      {
        id: "doc-2",
        name: "INE (Posterior)",
        verifiedBy: "veriff Capturado y verificado por Veriff",
        thumbnailUrl: DOCUMENT_THUMB,
        fullImageUrl: "https://placehold.co/600x400/e8e8e8/333?text=INE+Posterior",
      },
    ],
  },
  creditBureau: {
    clientAuthorized: true,
    scoreLabel: "Excelente",
    scoreLevel: "excellent",
  },
  biometrics: {
    items: [
      {
        id: "bio-1",
        name: "Foto de cliente",
        verifiedBy: "veriff Capturado y verificado por Veriff",
        thumbnailUrl: PHOTO_THUMB,
        type: "photo",
      },
      {
        id: "bio-2",
        name: "Índice izquierdo",
        verifiedBy: "veriff Capturado y verificado por Veriff",
        type: "fingerprint",
      },
      {
        id: "bio-3",
        name: "Índice derecho",
        verifiedBy: "veriff Capturado y verificado por Veriff",
        type: "fingerprint",
      },
    ],
  },
  purchaseIntention: {
    items: [
      {
        code: "01-SA-1007",
        name: "Sala Esquinera Valencia Beige...",
        brand: "Herwong",
        imageUrl: SOFA_IMAGE,
        quantity: 1,
        unitPrice: 20999,
        subtotal: 20999,
        promotionDiscount: 8400,
        total: 12599,
      },
    ],
    subtotal: 12599,
    total: 12599,
  },
};

export async function getCreditApplicationDetail(
  id: string
): Promise<CreditApplicationDetail | null> {
  await new Promise((r) => setTimeout(r, 400));
  const numId = Number(id);
  if (Number.isNaN(numId)) return null;
  if (numId === MOCK_CREDIT_APPLICATION_DETAIL.id) {
    return { ...MOCK_CREDIT_APPLICATION_DETAIL, id: numId };
  }
  return { ...MOCK_CREDIT_APPLICATION_DETAIL, id: numId };
}
