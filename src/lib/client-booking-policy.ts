/** Délai minimum avant le début du rdv pour autoriser l’annulation côté client. */
export const CLIENT_BOOKING_CANCEL_MIN_HOURS = 24;

export function clientCancelMinLeadMs(): number {
  return CLIENT_BOOKING_CANCEL_MIN_HOURS * 60 * 60 * 1000;
}

export function clientCanCancelBooking(
  dateTime: Date,
  now: Date = new Date(),
): boolean {
  return dateTime.getTime() - now.getTime() >= clientCancelMinLeadMs();
}

export function clientCancelBlockedMessage(): string {
  return `Annulation impossible : il reste moins de ${CLIENT_BOOKING_CANCEL_MIN_HOURS} h avant le début du rendez-vous. Contactez votre éducateur si besoin.`;
}
