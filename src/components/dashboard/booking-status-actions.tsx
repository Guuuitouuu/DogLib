"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  cancelEducatorBooking,
  completeEducatorBooking,
  confirmEducatorBooking,
} from "@/actions/educator-bookings";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { BookingStatus, type BookingStatusValue } from "@/lib/booking-ui";
import type { EducatorBookingItem } from "@/types/educator-booking";

type BookingStatusActionsProps = {
  bookingId: string;
  status: BookingStatusValue;
  compact?: boolean;
};

export function BookingStatusActions({
  bookingId,
  status,
  compact = false,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(
    action: (input: {
      bookingId: string;
    }) => Promise<ActionResult<EducatorBookingItem>>,
  ) {
    setPending(true);
    setError(null);
    const result = await action({ bookingId });
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Échec de l’action.");
      return;
    }
    router.refresh();
  }

  const size = compact ? "sm" : "default";

  return (
    <div className="flex flex-col gap-1.5">
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status === BookingStatus.PENDING ? (
          <>
            <Button
              type="button"
              size={size}
              disabled={pending}
              onClick={() => void run(confirmEducatorBooking)}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Confirmer"
              )}
            </Button>
            <Button
              type="button"
              size={size}
              variant="outline"
              disabled={pending}
              onClick={() => void run(cancelEducatorBooking)}
            >
              Annuler
            </Button>
          </>
        ) : null}
        {status === BookingStatus.CONFIRMED ? (
          <>
            <Button
              type="button"
              size={size}
              disabled={pending}
              onClick={() => void run(completeEducatorBooking)}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Terminer"
              )}
            </Button>
            <Button
              type="button"
              size={size}
              variant="outline"
              disabled={pending}
              onClick={() => void run(cancelEducatorBooking)}
            >
              Annuler
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
