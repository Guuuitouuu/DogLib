export type EducatorInvoiceStatus = "payee" | "en_attente" | "en_retard";

export type EducatorInvoiceItem = {
  id: string;
  number: string;
  dateLabel: string;
  dateTimeUtcIso: string;
  clientName: string;
  dogName: string;
  service: string;
  amountCents: number;
  status: EducatorInvoiceStatus;
  bookingHref: string;
};

export type EducatorBillingOverview = {
  invoices: EducatorInvoiceItem[];
  totalCents: number;
  paidCents: number;
  pendingCents: number;
  lateCents: number;
};

export type EducatorRevenueMonth = {
  /** Clé YYYY-MM (Paris) */
  key: string;
  /** Libellé court, ex. « janv. » */
  month: string;
  /** Revenus des séances COMPLETED, en euros entiers */
  valueEuros: number;
};
