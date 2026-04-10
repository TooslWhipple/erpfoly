import type {
  BasicInformationFormValues,
  CreditApplicationFormPayload,
} from "@/types/credit-application-form.types";

interface CreditApplicationRecord {
  id: string;
  basicInformation: BasicInformationFormValues;
}

const CREDIT_APPLICATIONS_MOCK_DB: CreditApplicationRecord[] = [
  {
    id: "2245",
    basicInformation: {
      firstName: "Jose Antonio",
      lastName: "Montes",
      secondLastName: "Molina",
      birthDate: "1995-01-15",
      maritalStatus: "Casado",
      curp: "MOMJ113003TY5",
      rfc: "MOMJ113003TY5",
      email: "jose.montes@correo.com",
      whatsappNumber: "6671234567",
      securityCode: "321654",
    },
  },
  {
    id: "2250",
    basicInformation: {
      firstName: "Alejandro",
      lastName: "Paredes",
      secondLastName: "Bustamante",
      birthDate: "1992-08-09",
      maritalStatus: "Soltero",
      curp: "PABA920809HSRLLN01",
      rfc: "PABA9208094A1",
      email: "alejandro.paredes@correo.com",
      whatsappNumber: "6672349876",
      securityCode: "998877",
    },
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCreditApplicationBasicInformation(
  applicationId: string
): Promise<BasicInformationFormValues | null> {
  await wait(700);
  if (applicationId === "500") {
    throw new Error("Simulated server failure");
  }
  const record = CREDIT_APPLICATIONS_MOCK_DB.find((item) => item.id === applicationId);
  return record?.basicInformation ?? null;
}

export async function validateSecurityCode(code: string): Promise<boolean> {
  await wait(450);
  return code.trim().length >= 6;
}

export async function saveCreditApplication(payload: CreditApplicationFormPayload): Promise<{ id: string }> {
  await wait(800);
  if (payload.id) {
    return { id: payload.id };
  }
  return { id: `new-${Date.now()}` };
}
