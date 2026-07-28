"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cancelClientBooking } from "@/actions/client-bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ClientCancelBookingButtonProps = {
  bookingId: string;
  dogName: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

export function ClientCancelBookingButton({
  bookingId,
  dogName,
  disabled,
  compact,
  className,
}: ClientCancelBookingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelClientBooking({ bookingId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        className={cn(
          "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
          className,
        )}
        disabled={disabled || pending}
        onClick={() => setOpen(true)}
      >
        Annuler le rdv
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader className="min-w-0">
            <DialogTitle>Annuler ce rendez-vous ?</DialogTitle>
            <DialogDescription className="break-words">
              Réservation pour <strong>{dogName}</strong>. Cette action est
              définitive ; l&apos;éducateur sera informé dans son agenda.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="break-words text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Retour
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-auto min-h-9 w-full whitespace-normal py-2 sm:w-auto"
              onClick={confirmCancel}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Confirmer l'annulation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
