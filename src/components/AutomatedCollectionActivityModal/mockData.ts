export type AutomatedCollectionActivityStatus = "successful" | "failed" | "pending";

export interface AutomatedCollectionActivityRow {
  id: string;
  date: string;
  phone: string;
  clientName: string;
  status: AutomatedCollectionActivityStatus;
}

export const MOCK_AUTOMATED_COLLECTION_ACTIVITY: AutomatedCollectionActivityRow[] = [
  {
    id: "1",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "2",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "3",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "4",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "5",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "6",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "7",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
  {
    id: "8",
    date: "19 Junio, 2025 11:40 am",
    phone: "667 123 4567",
    clientName: "María Daniela Montes Ávila",
    status: "successful",
  },
];

export const MOCK_MESSAGES_SENT_LAST_MONTH = 1599;
