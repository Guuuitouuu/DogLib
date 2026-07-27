export type ClientDogListItem = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  sessionsCount: number;
  reportsCount: number;
};

export type ClientDogDetail = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  behavioralNotes: string | null;
  medicalNotes: string | null;
  sessionsCount: number;
  completedSessionsCount: number;
  sessions: ClientDogSessionItem[];
};

export type ClientDogSessionItem = {
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
  totalSessions: number;
  completedSessions: number;
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
