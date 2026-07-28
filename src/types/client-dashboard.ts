export type ClientDogListItem = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  photoUrl: string | null;
  reservationsCount: number;
  reportsCount: number;
};

export type ClientDogDetail = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  photoUrl: string | null;
  behavioralNotes: string | null;
  medicalNotes: string | null;
  reservationsCount: number;
  completedReservationsCount: number;
  reservations: ClientDogReservationItem[];
};

export type ClientDogReservationItem = {
  bookingId: string;
  dateParis: string;
  timeParis: string;
  serviceTitle: string;
  educatorName: string;
  educatorProfileId: string;
  status: string;
  postSessionReport: string | null;
};

export type ClientDashboardSummary = {
  dogsCount: number;
  totalReservations: number;
  completedReservations: number;
  reportsCount: number;
};

export type ClientProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string;
  city: string;
  zipCode: string;
  imageUrl: string | null;
};

export type ClientLocation = {
  address: string;
  city: string;
  zipCode: string;
  lat: number;
  lng: number;
  phone: string | null;
};

export type ClientBookingItem = {
  id: string;
  status: string;
  dateParis: string;
  timeParis: string;
  durationMinutes: number;
  serviceTitle: string;
  priceCents: number;
  dogName: string;
  dogId: string;
  educatorName: string;
  educatorProfileId: string;
  location: string;
  postSessionReport: string | null;
  canCancel: boolean;
  cancelBlockedReason: string | null;
};

export type ClientBookingsOverview = {
  upcoming: ClientBookingItem[];
  past: ClientBookingItem[];
};
