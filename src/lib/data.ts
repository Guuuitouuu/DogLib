export type SessionStatus = "confirmee" | "en_attente" | "a_relancer"

export const statusLabels: Record<SessionStatus, string> = {
  confirmee: "Confirmée",
  en_attente: "En attente",
  a_relancer: "À relancer",
}

export type Session = {
  id: string
  dogName: string
  ownerName: string
  photo: string
  time: string
  type: string
  location: string
  status: SessionStatus
}

export const upcomingSessions: Session[] = [
  {
    id: "s1",
    dogName: "Ollie",
    ownerName: "Camille Dubois",
    photo: "/dogs/dog-1.png",
    time: "09:30",
    type: "Éducation de base",
    location: "Parc de la Tête d'Or",
    status: "confirmee",
  },
  {
    id: "s2",
    dogName: "Nala",
    ownerName: "Thomas Girard",
    photo: "/dogs/dog-2.png",
    time: "11:00",
    type: "Rappel & marche en laisse",
    location: "À domicile",
    status: "confirmee",
  },
  {
    id: "s3",
    dogName: "Gaston",
    ownerName: "Léa Moreau",
    photo: "/dogs/dog-3.png",
    time: "14:15",
    type: "Bilan comportemental",
    location: "Centre canin",
    status: "en_attente",
  },
  {
    id: "s4",
    dogName: "Pixel",
    ownerName: "Hugo Lefèvre",
    photo: "/dogs/dog-4.png",
    time: "16:30",
    type: "Socialisation chiot",
    location: "Parc de la Tête d'Or",
    status: "a_relancer",
  },
]

export type Client = {
  id: string
  ownerName: string
  dogName: string
  breed: string
  photo: string
  progress: number
  program: string
  nextSession: string
}

export const clients: Client[] = [
  {
    id: "c1",
    ownerName: "Camille Dubois",
    dogName: "Ollie",
    breed: "Golden Retriever",
    photo: "/dogs/dog-1.png",
    progress: 82,
    program: "Éducation de base",
    nextSession: "Auj. 09:30",
  },
  {
    id: "c2",
    ownerName: "Thomas Girard",
    dogName: "Nala",
    breed: "Border Collie",
    photo: "/dogs/dog-2.png",
    progress: 64,
    program: "Rappel avancé",
    nextSession: "Auj. 11:00",
  },
  {
    id: "c3",
    ownerName: "Léa Moreau",
    dogName: "Gaston",
    breed: "Bouledogue français",
    photo: "/dogs/dog-3.png",
    progress: 38,
    program: "Bilan comportemental",
    nextSession: "Demain 10:00",
  },
  {
    id: "c4",
    ownerName: "Hugo Lefèvre",
    dogName: "Pixel",
    breed: "Berger australien",
    photo: "/dogs/dog-4.png",
    progress: 21,
    program: "Socialisation chiot",
    nextSession: "Jeu. 16:30",
  },
  {
    id: "c5",
    ownerName: "Sarah Benoît",
    dogName: "Biscuit",
    breed: "Beagle",
    photo: "/dogs/dog-5.png",
    progress: 95,
    program: "Perfectionnement",
    nextSession: "Ven. 14:00",
  },
]

export type Task = {
  id: string
  label: string
  detail: string
  done: boolean
  tag: "relance" | "compte-rendu" | "facture"
}

export const tasks: Task[] = [
  {
    id: "t1",
    label: "Envoyer le compte-rendu de Gaston",
    detail: "Séance du 22 juillet",
    done: false,
    tag: "compte-rendu",
  },
  {
    id: "t2",
    label: "Relancer Hugo pour le paiement",
    detail: "Facture #2041 · 60 €",
    done: false,
    tag: "facture",
  },
  {
    id: "t3",
    label: "Appeler la famille de Pixel",
    detail: "Confirmer le créneau de jeudi",
    done: false,
    tag: "relance",
  },
  {
    id: "t4",
    label: "Préparer le programme de Biscuit",
    detail: "Perfectionnement — module 3",
    done: true,
    tag: "compte-rendu",
  },
]

export const revenue = [
  { month: "Fév", value: 2100 },
  { month: "Mar", value: 2450 },
  { month: "Avr", value: 2200 },
  { month: "Mai", value: 2980 },
  { month: "Juin", value: 3250 },
  { month: "Juil", value: 3820 },
]

/* ------------------------------------------------------------------ */
/* Chiens                                                              */
/* ------------------------------------------------------------------ */

export type DogLevel = "debutant" | "intermediaire" | "avance"

export const dogLevelLabels: Record<DogLevel, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
}

export type Dog = {
  id: string
  name: string
  breed: string
  photo: string
  ageMonths: number
  ownerName: string
  program: string
  progress: number
  level: DogLevel
  traits: string[]
  sessionsDone: number
}

export const dogs: Dog[] = [
  {
    id: "d1",
    name: "Ollie",
    breed: "Golden Retriever",
    photo: "/dogs/dog-1.png",
    ageMonths: 22,
    ownerName: "Camille Dubois",
    program: "Éducation de base",
    progress: 82,
    level: "avance",
    traits: ["Joueur", "Gourmand", "Sociable"],
    sessionsDone: 9,
  },
  {
    id: "d2",
    name: "Nala",
    breed: "Border Collie",
    photo: "/dogs/dog-2.png",
    ageMonths: 30,
    ownerName: "Thomas Girard",
    program: "Rappel avancé",
    progress: 64,
    level: "intermediaire",
    traits: ["Énergique", "Vif", "Attentif"],
    sessionsDone: 6,
  },
  {
    id: "d3",
    name: "Gaston",
    breed: "Bouledogue français",
    photo: "/dogs/dog-3.png",
    ageMonths: 14,
    ownerName: "Léa Moreau",
    program: "Bilan comportemental",
    progress: 38,
    level: "debutant",
    traits: ["Têtu", "Affectueux"],
    sessionsDone: 3,
  },
  {
    id: "d4",
    name: "Pixel",
    breed: "Berger australien",
    photo: "/dogs/dog-4.png",
    ageMonths: 8,
    ownerName: "Hugo Lefèvre",
    program: "Socialisation chiot",
    progress: 21,
    level: "debutant",
    traits: ["Curieux", "Timide"],
    sessionsDone: 2,
  },
  {
    id: "d5",
    name: "Biscuit",
    breed: "Beagle",
    photo: "/dogs/dog-5.png",
    ageMonths: 36,
    ownerName: "Sarah Benoît",
    program: "Perfectionnement",
    progress: 95,
    level: "avance",
    traits: ["Pisteur", "Gourmand", "Obéissant"],
    sessionsDone: 12,
  },
  {
    id: "d6",
    name: "Mango",
    breed: "Cavalier King Charles",
    photo: "/dogs/dog-1.png",
    ageMonths: 11,
    ownerName: "Yasmine Roy",
    program: "Éducation de base",
    progress: 47,
    level: "intermediaire",
    traits: ["Câlin", "Calme"],
    sessionsDone: 4,
  },
]

/* ------------------------------------------------------------------ */
/* Agenda                                                              */
/* ------------------------------------------------------------------ */

export type AgendaEvent = {
  id: string
  day: number // 0 = Lundi ... 6 = Dimanche
  start: string
  end: string
  dogName: string
  ownerName: string
  type: string
  location: string
  status: SessionStatus
}

export const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export const agendaEvents: AgendaEvent[] = [
  {
    id: "a1",
    day: 0,
    start: "09:30",
    end: "10:30",
    dogName: "Ollie",
    ownerName: "Camille Dubois",
    type: "Éducation de base",
    location: "Parc de la Tête d'Or",
    status: "confirmee",
  },
  {
    id: "a2",
    day: 0,
    start: "11:00",
    end: "12:00",
    dogName: "Nala",
    ownerName: "Thomas Girard",
    type: "Rappel & laisse",
    location: "À domicile",
    status: "confirmee",
  },
  {
    id: "a3",
    day: 0,
    start: "14:15",
    end: "15:15",
    dogName: "Gaston",
    ownerName: "Léa Moreau",
    type: "Bilan comportemental",
    location: "Centre canin",
    status: "en_attente",
  },
  {
    id: "a4",
    day: 1,
    start: "10:00",
    end: "11:00",
    dogName: "Mango",
    ownerName: "Yasmine Roy",
    type: "Éducation de base",
    location: "Centre canin",
    status: "confirmee",
  },
  {
    id: "a5",
    day: 2,
    start: "09:00",
    end: "10:00",
    dogName: "Biscuit",
    ownerName: "Sarah Benoît",
    type: "Perfectionnement",
    location: "Parc de la Tête d'Or",
    status: "confirmee",
  },
  {
    id: "a6",
    day: 3,
    start: "16:30",
    end: "17:30",
    dogName: "Pixel",
    ownerName: "Hugo Lefèvre",
    type: "Socialisation chiot",
    location: "Parc de la Tête d'Or",
    status: "a_relancer",
  },
  {
    id: "a7",
    day: 4,
    start: "14:00",
    end: "15:00",
    dogName: "Biscuit",
    ownerName: "Sarah Benoît",
    type: "Perfectionnement",
    location: "Centre canin",
    status: "confirmee",
  },
  {
    id: "a8",
    day: 4,
    start: "17:00",
    end: "18:00",
    dogName: "Nala",
    ownerName: "Thomas Girard",
    type: "Rappel avancé",
    location: "À domicile",
    status: "en_attente",
  },
]

export const agendaHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

/* ------------------------------------------------------------------ */
/* Séances (historique + à venir)                                      */
/* ------------------------------------------------------------------ */

export type SessionRecord = {
  id: string
  date: string
  dogName: string
  ownerName: string
  photo: string
  type: string
  duration: string
  location: string
  status: SessionStatus
  price: number
}

export const sessionRecords: SessionRecord[] = [
  {
    id: "r1",
    date: "27 juil. · 09:30",
    dogName: "Ollie",
    ownerName: "Camille Dubois",
    photo: "/dogs/dog-1.png",
    type: "Éducation de base",
    duration: "1h00",
    location: "Parc de la Tête d'Or",
    status: "confirmee",
    price: 55,
  },
  {
    id: "r2",
    date: "27 juil. · 11:00",
    dogName: "Nala",
    ownerName: "Thomas Girard",
    photo: "/dogs/dog-2.png",
    type: "Rappel & marche en laisse",
    duration: "1h00",
    location: "À domicile",
    status: "confirmee",
    price: 60,
  },
  {
    id: "r3",
    date: "27 juil. · 14:15",
    dogName: "Gaston",
    ownerName: "Léa Moreau",
    photo: "/dogs/dog-3.png",
    type: "Bilan comportemental",
    duration: "1h30",
    location: "Centre canin",
    status: "en_attente",
    price: 80,
  },
  {
    id: "r4",
    date: "26 juil. · 16:30",
    dogName: "Pixel",
    ownerName: "Hugo Lefèvre",
    photo: "/dogs/dog-4.png",
    type: "Socialisation chiot",
    duration: "0h45",
    location: "Parc de la Tête d'Or",
    status: "a_relancer",
    price: 45,
  },
  {
    id: "r5",
    date: "25 juil. · 14:00",
    dogName: "Biscuit",
    ownerName: "Sarah Benoît",
    photo: "/dogs/dog-5.png",
    type: "Perfectionnement",
    duration: "1h00",
    location: "Centre canin",
    status: "confirmee",
    price: 55,
  },
  {
    id: "r6",
    date: "24 juil. · 10:00",
    dogName: "Mango",
    ownerName: "Yasmine Roy",
    photo: "/dogs/dog-1.png",
    type: "Éducation de base",
    duration: "1h00",
    location: "Centre canin",
    status: "confirmee",
    price: 55,
  },
]

/* ------------------------------------------------------------------ */
/* Facturation                                                         */
/* ------------------------------------------------------------------ */

export type InvoiceStatus = "payee" | "en_attente" | "en_retard"

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  payee: "Payée",
  en_attente: "En attente",
  en_retard: "En retard",
}

export type Invoice = {
  id: string
  number: string
  clientName: string
  dogName: string
  date: string
  amount: number
  status: InvoiceStatus
  service: string
}

export const invoices: Invoice[] = [
  {
    id: "i1",
    number: "#2048",
    clientName: "Camille Dubois",
    dogName: "Ollie",
    date: "27 juil. 2026",
    amount: 55,
    status: "payee",
    service: "Éducation de base",
  },
  {
    id: "i2",
    number: "#2047",
    clientName: "Sarah Benoît",
    dogName: "Biscuit",
    date: "25 juil. 2026",
    amount: 55,
    status: "payee",
    service: "Perfectionnement",
  },
  {
    id: "i3",
    number: "#2046",
    clientName: "Léa Moreau",
    dogName: "Gaston",
    date: "24 juil. 2026",
    amount: 80,
    status: "en_attente",
    service: "Bilan comportemental",
  },
  {
    id: "i4",
    number: "#2045",
    clientName: "Yasmine Roy",
    dogName: "Mango",
    date: "22 juil. 2026",
    amount: 55,
    status: "en_attente",
    service: "Éducation de base",
  },
  {
    id: "i5",
    number: "#2041",
    clientName: "Hugo Lefèvre",
    dogName: "Pixel",
    date: "15 juil. 2026",
    amount: 60,
    status: "en_retard",
    service: "Socialisation chiot",
  },
  {
    id: "i6",
    number: "#2038",
    clientName: "Thomas Girard",
    dogName: "Nala",
    date: "12 juil. 2026",
    amount: 60,
    status: "payee",
    service: "Rappel avancé",
  },
]
