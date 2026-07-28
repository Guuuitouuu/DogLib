export type EducatorManualBookingClient = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  dogs: {
    id: string;
    name: string;
    breed: string | null;
  }[];
};

export type EducatorManualBookingFormData = {
  educatorProfileId: string;
  services: {
    id: string;
    title: string;
    durationMinutes: number;
    priceCents: number;
    isActive: boolean;
  }[];
  clients: EducatorManualBookingClient[];
};
