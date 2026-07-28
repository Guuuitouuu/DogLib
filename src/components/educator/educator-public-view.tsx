"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  PawPrint,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createBooking,
  createDog,
  getAvailableSlots,
  getMyDogs,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import { toParisDateString } from "@/lib/paris-time";

type Props = {
  educatorProfileId: string;
  services: EducatorPublicService[];
  returnPath: string;
};

export function EducatorBookingSection({
  educatorProfileId,
  services,
  returnPath,
}: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id ?? "",
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId],
  );

  const dateParis = selectedDate ? toParisDateString(selectedDate) : null;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (!selectedServiceId || !dateParis) {
        setSlots([]);
        return;
      }

      setSlotsLoading(true);
      setSlotsError(null);
      const result = await getAvailableSlots({
        educatorProfileId,
        serviceId: selectedServiceId,
        dateParis,
      });
      if (cancelled) return;

      setSlotsLoading(false);
      if (!result.success) {
        setSlots([]);
        setSlotsError(result.error);
        return;
      }
      setSlots(result.data);
    })();

    return () => {
      cancelled = true;
    };
  }, [dateParis, educatorProfileId, selectedServiceId]);

  const refreshSlots = useCallback(async () => {
    if (!selectedServiceId || !dateParis) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsError(null);
    const result = await getAvailableSlots({
      educatorProfileId,
      serviceId: selectedServiceId,
      dateParis,
    });
    setSlotsLoading(false);
    if (!result.success) {
      setSlots([]);
      setSlotsError(result.error);
      return;
    }
    setSlots(result.data);
  }, [dateParis, educatorProfileId, selectedServiceId]);

  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(returnPath)}`;

  function openBookingDialog(slot: AvailableSlot) {
    setSelectedSlot(slot);
    setDialogOpen(true);
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Réservation</CardTitle>
          <CardDescription>
            Cet éducateur n’a pas encore publié de services.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PawPrint className="size-5 text-primary" aria-hidden />
              Services
            </CardTitle>
            <CardDescription>
              Choisissez un service pour voir les créneaux disponibles.
            </CardDescription>
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
                    <p className="font-medium text-foreground">
                      {service.title}
                    </p>
                    <Badge variant="secondary">
                      {formatPriceEurosFromCents(service.priceCents)}
                    </Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {service.durationMinutes} min
                  </p>
                  {service.description ? (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="size-5 text-primary" aria-hidden />
              Date et horaires
            </CardTitle>
            <CardDescription>
              Fuseau horaire : Europe/Paris
              {selectedService
                ? ` · créneaux de ${selectedService.durationMinutes} min`
                : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              disabled={{ before: new Date() }}
              className="mx-auto rounded-xl border"
            />

            {slotsError ? (
              <p className="text-sm text-destructive" role="alert">
                {slotsError}
              </p>
            ) : null}

            {slotsLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Chargement des créneaux…
              </div>
            ) : slots.length === 0 && !slotsLoading ? (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Aucun créneau disponible pour cette date.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.startUtcIso}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openBookingDialog(slot)}
                  >
                    Réserver · {slot.label}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isAuthReady={isLoaded}
        isSignedIn={Boolean(isSignedIn)}
        signInHref={signInHref}
        educatorProfileId={educatorProfileId}
        service={selectedService}
        slot={selectedSlot}
        onBooked={() => {
          setDialogOpen(false);
          setSelectedSlot(null);
          void refreshSlots();
        }}
      />
    </>
  );
}

type BookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthReady: boolean;
  isSignedIn: boolean;
  signInHref: string;
  educatorProfileId: string;
  service: EducatorPublicService | undefined;
  slot: AvailableSlot | null;
  onBooked: () => void;
};

function BookingDialog({
  open,
  onOpenChange,
  isAuthReady,
  isSignedIn,
  signInHref,
  educatorProfileId,
  service,
  slot,
  onBooked,
}: BookingDialogProps) {
  const [dogs, setDogs] = useState<ClientDogItem[]>([]);
  const [dogsLoading, setDogsLoading] = useState(false);
  const [dogsError, setDogsError] = useState<string | null>(null);
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [showAddDog, setShowAddDog] = useState(false);
  const [newDogName, setNewDogName] = useState("");
  const [newDogBreed, setNewDogBreed] = useState("");
  const [addingDog, setAddingDog] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadDogs = useCallback(async () => {
    setDogsLoading(true);
    setDogsError(null);
    const result = await getMyDogs();
    setDogsLoading(false);
    if (!result.success) {
      setDogs([]);
      setDogsError(result.error);
      return;
    }
    setDogs(result.data);
    if (result.data.length > 0) {
      setSelectedDogId((current) => current || result.data[0].id);
    }
  }, []);

  function handleDialogOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (nextOpen && isSignedIn) {
      setSuccessMessage(null);
      setFormError(null);
      void loadDogs();
    }
  }

  async function handleAddDog(e: React.FormEvent) {
    e.preventDefault();
    setAddingDog(true);
    setFormError(null);
    const result = await createDog({
      name: newDogName.trim(),
      breed: newDogBreed.trim() || undefined,
    });
    setAddingDog(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setDogs((prev) => [...prev, result.data]);
    setSelectedDogId(result.data.id);
    setNewDogName("");
    setNewDogBreed("");
    setShowAddDog(false);
  }

  async function handleConfirmBooking() {
    if (!service || !slot || !selectedDogId) {
      setFormError("Sélectionnez un chien pour confirmer.");
      return;
    }
    setBookingPending(true);
    setFormError(null);
    const result = await createBooking({
      educatorProfileId,
      serviceId: service.id,
      dogId: selectedDogId,
      slotStartUtcIso: slot.startUtcIso,
    });
    setBookingPending(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setSuccessMessage("Réservation enregistrée (en attente de confirmation).");
    onBooked();
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Réserver une réservation</DialogTitle>
          <DialogDescription>
            {service && slot
              ? `${service.title} · ${slot.label} (Paris)`
              : "Choisissez un créneau sur le calendrier."}
          </DialogDescription>
        </DialogHeader>

        {!isAuthReady ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !isSignedIn ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Connectez-vous ou créez un compte pour réserver. La réservation
              nécessite un compte propriétaire.
            </p>
            <Link
              href={signInHref}
              className={buttonVariants({ className: "w-full" })}
            >
              Se connecter / S&apos;inscrire
            </Link>
          </div>
        ) : successMessage ? (
          <p className="py-4 text-sm text-foreground">{successMessage}</p>
        ) : (
          <div className="space-y-4">
            {dogsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Chargement de vos chiens…
              </div>
            ) : null}

            {dogsError ? (
              <p className="text-sm text-destructive" role="alert">
                {dogsError}
              </p>
            ) : null}

            {dogs.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="dog-select">Votre chien</Label>
                <div className="flex flex-col gap-2">
                  {dogs.map((dog) => (
                    <button
                      key={dog.id}
                      type="button"
                      onClick={() => setSelectedDogId(dog.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                        selectedDogId === dog.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <PawPrint className="size-4 shrink-0 text-primary" />
                      <span className="font-medium">{dog.name}</span>
                      {dog.breed ? (
                        <span className="text-muted-foreground">
                          · {dog.breed}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : !dogsLoading && !showAddDog ? (
              <p className="text-sm text-muted-foreground">
                Ajoutez un chien pour continuer.
              </p>
            ) : null}

            {showAddDog ? (
              <form onSubmit={handleAddDog} className="space-y-3 rounded-lg border p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dog-name">Nom</Label>
                  <Input
                    id="dog-name"
                    value={newDogName}
                    onChange={(e) => setNewDogName(e.target.value)}
                    required
                    maxLength={80}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dog-breed">Race (optionnel)</Label>
                  <Input
                    id="dog-breed"
                    value={newDogBreed}
                    onChange={(e) => setNewDogBreed(e.target.value)}
                    maxLength={80}
                    autoComplete="off"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={addingDog}>
                    {addingDog ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Enregistrer"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddDog(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddDog(true)}
              >
                Ajouter un chien
              </Button>
            )}

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
          </div>
        )}

        {isSignedIn && !successMessage && isAuthReady ? (
          <DialogFooter>
            <Button
              type="button"
              onClick={handleConfirmBooking}
              disabled={
                bookingPending ||
                !slot ||
                !service ||
                (!selectedDogId && dogs.length > 0)
              }
            >
              {bookingPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Confirmation…
                </>
              ) : (
                "Confirmer la réservation"
              )}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function EducatorPublicHeader({
  name,
  city,
  address,
  zipCode,
  bio,
}: {
  name: string;
  city: string;
  address: string;
  zipCode: string;
  bio: string | null;
}) {
  return (
    <header className="space-y-3 border-b border-border bg-card/50 px-5 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-primary">Éducateur canin</p>
        <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
          <UserRound className="size-7 text-primary" aria-hidden />
          {name}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {address}, {zipCode} {city}
        </p>
        {bio ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/90">
            {bio}
          </p>
        ) : null}
      </div>
    </header>
  );
}
