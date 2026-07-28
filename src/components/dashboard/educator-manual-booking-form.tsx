"use client";

import { fr } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createEducatorManualBooking } from "@/actions/educator-manual-booking";
import { getAvailableSlots } from "@/actions/booking";
import type { AvailableSlot } from "@/lib/availability-slots";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import { toParisDateString } from "@/lib/paris-time";
import type {
  EducatorManualBookingClient,
  EducatorManualBookingFormData,
} from "@/types/educator-manual-booking";

type Step = 1 | 2 | 3 | 4;
type ClientMode = "existing" | "new";

const EMPTY_DOGS: EducatorManualBookingClient["dogs"] = [];

type EducatorManualBookingFormProps = EducatorManualBookingFormData;

export function EducatorManualBookingForm({
  educatorProfileId,
  services,
  clients: initialClients,
}: EducatorManualBookingFormProps) {
  const router = useRouter();
  const activeServices = useMemo(
    () => services.filter((s) => s.isActive),
    [services],
  );

  const [step, setStep] = useState<Step>(1);
  const [clientMode, setClientMode] = useState<ClientMode>(
    initialClients.length > 0 ? "existing" : "new",
  );
  const [clients] = useState(initialClients);
  const [selectedClientUserId, setSelectedClientUserId] = useState(
    initialClients[0]?.userId ?? "",
  );
  const [selectedDogId, setSelectedDogId] = useState(
    initialClients[0]?.dogs[0]?.id ?? "",
  );

  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState(
    activeServices[0]?.id ?? "",
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.userId === selectedClientUserId),
    [clients, selectedClientUserId],
  );
  const clientDogs = useMemo(
    () => selectedClient?.dogs ?? EMPTY_DOGS,
    [selectedClient],
  );

  useEffect(() => {
    if (clientMode !== "existing") return;
    if (!selectedClientUserId && clients[0]) {
      setSelectedClientUserId(clients[0].userId);
      setSelectedDogId(clients[0].dogs[0]?.id ?? "");
      return;
    }
    if (
      selectedClientUserId &&
      clientDogs.length > 0 &&
      !clientDogs.some((d) => d.id === selectedDogId)
    ) {
      setSelectedDogId(clientDogs[0].id);
    }
  }, [
    clientMode,
    clients,
    selectedClientUserId,
    clientDogs,
    selectedDogId,
  ]);

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === selectedServiceId),
    [activeServices, selectedServiceId],
  );

  const dateParis = selectedDate ? toParisDateString(selectedDate) : null;

  const loadSlots = useCallback(async () => {
    if (!selectedServiceId || !dateParis) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);
    const requestKey = `${selectedServiceId}:${dateParis}`;
    try {
      const result = await getAvailableSlots({
        educatorProfileId,
        serviceId: selectedServiceId,
        dateParis,
      });
      if (requestKey !== `${selectedServiceId}:${dateParis}`) return;
      setSlotsLoading(false);
      if (!result.success) {
        setSlots([]);
        setSlotsError(result.error);
        return;
      }
      setSlots(result.data);
    } catch {
      if (requestKey !== `${selectedServiceId}:${dateParis}`) return;
      setSlotsLoading(false);
      setSlots([]);
      setSlotsError("Impossible de charger les créneaux.");
    }
  }, [dateParis, educatorProfileId, selectedServiceId]);

  useEffect(() => {
    if (step !== 3) return;
    void loadSlots();
  }, [step, loadSlots]);

  if (activeServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun service actif</CardTitle>
          <CardDescription>
            Ajoutez au moins un service avant de créer une réservation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/services"
            className={buttonVariants({ variant: "default" })}
          >
            Gérer mes services
          </Link>
        </CardContent>
      </Card>
    );
  }

  function validateClientStep(): boolean {
    if (clientMode === "existing") {
      if (!selectedClientUserId || !selectedDogId) {
        setError("Sélectionnez un client et un chien.");
        return false;
      }
      return true;
    }
    if (!ownerName.trim() || !email.trim() || !dogName.trim()) {
      setError("Nom du client, e-mail et nom du chien sont obligatoires.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!selectedService || !selectedSlot) {
      setError("Informations incomplètes.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload =
      clientMode === "existing"
        ? {
            mode: "existing" as const,
            clientUserId: selectedClientUserId,
            dogId: selectedDogId,
            serviceId: selectedService.id,
            slotStartUtcIso: selectedSlot.startUtcIso,
          }
        : {
            mode: "new" as const,
            ownerName: ownerName.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            dogName: dogName.trim(),
            dogBreed: dogBreed.trim() || undefined,
            serviceId: selectedService.id,
            slotStartUtcIso: selectedSlot.startUtcIso,
          };

    const result = await createEducatorManualBooking(payload);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/dashboard/reservations/${result.data.bookingId}`);
    router.refresh();
  }

  const summaryClientLabel =
    clientMode === "existing"
      ? `${selectedClient?.name ?? "—"} · ${
          clientDogs.find((d) => d.id === selectedDogId)?.name ?? "—"
        }`
      : `${ownerName.trim()} · ${dogName.trim()}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-3" })}
        >
          ← Tableau de bord
        </Link>
        <p className="text-sm font-medium text-primary">Réservation manuelle</p>
        <h2 className="text-2xl font-bold tracking-tight">
          Nouvelle réservation
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Étape {step} sur 4 — la réservation est enregistrée comme{" "}
          <strong>confirmée</strong>.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
        {(["Client", "Service", "Créneau", "Confirmation"] as const).map(
          (label, i) => {
            const n = (i + 1) as Step;
            const active = step === n;
            const done = step > n;
            return (
              <li
                key={label}
                className={cn(
                  "flex min-w-[4.5rem] flex-1 items-center justify-center rounded-full border px-2 py-1.5",
                  active && "border-primary bg-primary/10 text-primary",
                  done && "border-primary/40 text-foreground",
                )}
              >
                {done ? <Check className="mr-1 size-3" aria-hidden /> : null}
                {label}
              </li>
            );
          },
        )}
      </ol>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Client et chien</CardTitle>
            <CardDescription>
              Choisissez un client déjà suivi ou enregistrez un nouveau client
              avec son chien.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={clientMode === "existing" ? "default" : "outline"}
                size="sm"
                disabled={clients.length === 0}
                onClick={() => {
                  setClientMode("existing");
                  setError(null);
                }}
              >
                <Users className="size-4" aria-hidden />
                Client existant
              </Button>
              <Button
                type="button"
                variant={clientMode === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setClientMode("new");
                  setError(null);
                }}
              >
                <UserPlus className="size-4" aria-hidden />
                Nouveau client
              </Button>
            </div>

            {clientMode === "existing" ? (
              clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun client dans votre historique. Utilisez « Nouveau client
                  ».
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="client-select">Client</Label>
                    <select
                      id="client-select"
                      value={selectedClientUserId}
                      onChange={(e) => {
                        setSelectedClientUserId(e.target.value);
                        const next = clients.find(
                          (c) => c.userId === e.target.value,
                        );
                        setSelectedDogId(next?.dogs[0]?.id ?? "");
                      }}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {clients.map((client) => (
                        <option key={client.userId} value={client.userId}>
                          {client.name} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dog-select">Chien</Label>
                    <select
                      id="dog-select"
                      value={selectedDogId}
                      onChange={(e) => setSelectedDogId(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      disabled={clientDogs.length === 0}
                    >
                      {clientDogs.map((dog) => (
                        <option key={dog.id} value={dog.id}>
                          {dog.name}
                          {dog.breed ? ` (${dog.breed})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="owner-name">Nom du client</Label>
                  <Input
                    id="owner-name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    maxLength={120}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-email">E-mail</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-phone">Téléphone (optionnel)</Label>
                  <Input
                    id="owner-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-dog-name">Nom du chien</Label>
                  <Input
                    id="new-dog-name"
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-dog-breed">Race (optionnel)</Label>
                  <Input
                    id="new-dog-breed"
                    value={dogBreed}
                    onChange={(e) => setDogBreed(e.target.value)}
                    maxLength={80}
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setError(null);
                if (!validateClientStep()) return;
                setStep(2);
              }}
            >
              Continuer
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeServices.map((service) => {
              const active = service.id === selectedServiceId;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold">{service.title}</p>
                    <Badge variant="secondary">
                      {formatPriceEurosFromCents(service.priceCents)}
                    </Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {service.durationMinutes} min
                  </p>
                </button>
              );
            })}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="size-4" aria-hidden />
                Retour
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!selectedServiceId}
                onClick={() => {
                  setError(null);
                  setStep(3);
                }}
              >
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="size-5 text-primary" aria-hidden />
                Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Créneaux disponibles</CardTitle>
              <CardDescription>
                {selectedService?.title} · Europe/Paris
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement…
                </div>
              ) : null}
              {slotsError ? (
                <p className="text-sm text-destructive">{slotsError}</p>
              ) : null}
              {!slotsLoading && slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun créneau ce jour-là. Essayez une autre date ou vérifiez
                  vos disponibilités.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.startUtcIso}
                      type="button"
                      variant={
                        selectedSlot?.startUtcIso === slot.startUtcIso
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Retour
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!selectedSlot}
                  onClick={() => {
                    setError(null);
                    setStep(4);
                  }}
                >
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle>Confirmation</CardTitle>
            <CardDescription>
              Vérifiez les informations avant d&apos;enregistrer la réservation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Client · chien</dt>
                <dd className="font-medium text-foreground">
                  {summaryClientLabel}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Service</dt>
                <dd className="font-medium text-foreground">
                  {selectedService?.title}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Créneau</dt>
                <dd className="font-medium text-foreground">
                  {selectedSlot?.label ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Statut</dt>
                <dd className="font-medium text-foreground">Confirmée</dd>
              </div>
            </dl>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                <ChevronLeft className="size-4" aria-hidden />
                Retour
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Créer la réservation"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
