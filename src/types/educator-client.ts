export type EducatorClientItem = {
  id: string;
  ownerName: string;
  email: string | null;
  dogId: string;
  dogName: string;
  breed: string | null;
  program: string;
  completedSessions: number;
  totalSessions: number;
  /** 0–100 : séances terminées / total (hors annulées) */
  progress: number;
  nextSessionLabel: string;
  nextSessionHref: string | null;
};
