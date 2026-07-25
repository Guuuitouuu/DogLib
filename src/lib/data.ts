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
