"use client";

import Link from "next/link";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  PawPrint,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClientDog } from "@/actions/client-dogs";
import {
  createBooking,
  getAvailableSlots,
  type ClientDogItem,
  type EducatorPublicService,
} from "@/actions/booking";
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

type Step = 1 | 2 | 3 | 4;

type EducatorReservationFlowProps = {
  educatorProfileId: string;
  educatorName: string;
  services: EducatorPublicService[];
  initialServiceId?: string;
  initialDogs: ClientDogItem[];
};

export function EducatorReservationFlow({
  educatorProfileId,
  educatorName,
  services,
  initialServiceId,
  initialDogs,
}: EducatorReservationFlowProps) {
  const defaultServiceId =
    initialServiceId && services.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : (services[0]?.id ?? "");

  const [step, setStep] = useState<Step>(
    defaultServiceId && services.length > 0 ? 2 : 1,
  );
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServiceId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [dogs, setDogs] = useState<ClientDogItem[]>(initialDogs);
  const [selectedDogId, setSelectedDogId] = useState(initialDogs[0]?.id ?? "");
  const [showAddDog, setShowAddDog] = useState(initialDogs.length === 0);
  const [addingDog, setAddingDog] = useState(false);

  const [confirmPending, setConfirmPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId],
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
      setSlotsError(
        "Connexion interrompue. Si le message persiste, arrêtez tous les serveurs dev, lancez npm run dev:clean puis npm run dev:stable.",
      );
    }
  }, [dateParis, educatorProfileId, selectedServiceId]);

  useEffect(() => {
    if (step !== 2) return;
    void loadSlots();
  }, [step, loadSlots]);

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Réservation indisponible</CardTitle>
          <CardDescription>
            Cet éducateur n&apos;a pas de services actifs pour le moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={`/educator/${educatorProfileId}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Retour au profil
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function handleAddDog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddingDog(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await createClientDog({
      name: String(fd.get("name") ?? ""),
      breed: String(fd.get("breed") ?? "") || undefined,
      age: fd.get("age") ? Number(fd.get("age")) : undefined,
      behavioralNotes: String(fd.get("behavioralNotes") ?? "") || undefined,
    });
    setAddingDog(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    const item: ClientDogItem = {
      id: result.data.id,
      name: result.data.name,
      breed: result.data.breed,
    };
    setDogs((prev) => [...prev, item]);
    setSelectedDogId(item.id);
    setShowAddDog(false);
    e.currentTarget.reset();
  }

  async function handleConfirm() {
    if (!selectedService || !selectedSlot || !selectedDogId) {
      setError("Informations incomplètes.");
      return;
    }
    setConfirmPending(true);
    setError(null);
    const result = await createBooking({
      educatorProfileId,
      serviceId: selectedService.id,
      dogId: selectedDogId,
      slotStartUtcIso: selectedSlot.startUtcIso,
    });
    setConfirmPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    window.location.assign("/account?reservation=success");
  }

  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Réservation</p>
        <h1 className="text-2xl font-bold tracking-tight">{educatorName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Étape {step} sur 4 — demande envoyée en statut « en attente » après
          confirmation.
        </p>
      </div>

      <ol className="flex gap-2 text-xs font-medium text-muted-foreground">
        {(["Service", "Créneau", "Chien", "Confirmation"] as const).map(
          (label, i) => {
            const n = (i + 1) as Step;
            const active = step === n;
            const done = step > n;
            return (
              <li
                key={label}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-full border px-2 py-1.5",
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
            <CardTitle>Choisir un service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => {
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
            <Button
              type="button"
              className="w-full"
              disabled={!selectedServiceId}
              onClick={() => {
                setError(null);
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
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Créneaux disponibles</CardTitle>
              <CardDescription>
                {selectedService?.title} · fuseau Europe/Paris
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
                  Aucun créneau ce jour-là. Essayez une autre date.
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
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Retour
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!selectedSlot}
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
        </div>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="size-5 text-primary" aria-hidden />
              Votre chien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dogs.length > 0 && !showAddDog ? (
              <div className="space-y-2">
                <Label htmlFor="dog-select">Chien pour cette séance</Label>
                <select
                  id="dog-select"
                  value={selectedDogId}
                  onChange={(e) => setSelectedDogId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {dogs.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name}
                      {dog.breed ? ` (${dog.breed})` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0"
                  onClick={() => setShowAddDog(true)}
                >
                  Ajouter un autre chien
                </Button>
              </div>
            ) : null}

            {showAddDog ? (
              <form onSubmit={(e) => void handleAddDog(e)} className="space-y-3 rounded-lg border p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="res-dog-name">Nom</Label>
                  <Input id="res-dog-name" name="name" required maxLength={80} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="res-dog-breed">Race</Label>
                    <Input id="res-dog-breed" name="breed" maxLength={80} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="res-dog-age">Âge (ans)</Label>
                    <Input
                      id="res-dog-age"
                      name="age"
                      type="number"
                      min={0}
                      max={30}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="res-dog-notes">Particularités</Label>
                  <textarea
                    id="res-dog-notes"
                    name="behavioralNotes"
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Comportement, peurs, objectifs…"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addingDog}>
                    {addingDog ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Enregistrer le chien"
                    )}
                  </Button>
                  {dogs.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddDog(false)}
                    >
                      Annuler
                    </Button>
                  ) : null}
                </div>
              </form>
            ) : dogs.length === 0 ? null : null}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                <ChevronLeft className="size-4" aria-hidden />
                Retour
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!selectedDogId}
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
      ) : null}

      {step === 4 && selectedService && selectedSlot && selectedDog ? (
        <Card>
          <CardHeader>
            <CardTitle>Confirmation</CardTitle>
            <CardDescription>
              Vérifiez les informations avant d&apos;envoyer votre demande.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Éducateur</dt>
                <dd className="font-medium">{educatorName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Service</dt>
                <dd className="font-medium">{selectedService.title}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Créneau</dt>
                <dd className="font-medium">
                  {dateParis} · {selectedSlot.label}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Chien</dt>
                <dd className="font-medium">{selectedDog.name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="text-muted-foreground">Tarif</dt>
                <dd className="text-base font-bold text-primary">
                  {formatPriceEurosFromCents(selectedService.priceCents)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                <ChevronLeft className="size-4" aria-hidden />
                Retour
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={confirmPending}
                onClick={() => void handleConfirm()}
              >
                {confirmPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirmer la demande"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Link
        href={`/educator/${educatorProfileId}`}
        className={buttonVariants({ variant: "link", className: "h-auto px-0" })}
      >
        ← Retour au profil éducateur
      </Link>
    </div>
  );
}
