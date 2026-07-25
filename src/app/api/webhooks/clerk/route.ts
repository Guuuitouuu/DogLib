import { headers } from "next/headers";
import { Webhook } from "svix";

import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkPhoneNumber = {
  phone_number: string;
};

type ClerkUserPayload = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: ClerkPhoneNumber[];
  public_metadata?: Record<string, unknown>;
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserPayload;
};

function primaryEmail(user: ClerkUserPayload): string {
  const primary = user.email_addresses.find(
    (entry) => entry.id === user.primary_email_address_id,
  );
  return (
    primary?.email_address ??
    user.email_addresses[0]?.email_address ??
    `unknown+${user.id}@doglib.local`
  );
}

function displayName(user: ClerkUserPayload): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return user.username;
  return primaryEmail(user);
}

function primaryPhone(user: ClerkUserPayload): string | undefined {
  return user.phone_numbers[0]?.phone_number;
}

function metadataRole(metadata: Record<string, unknown> | undefined): Role | undefined {
  const role = metadata?.role;
  if (role === "EDUCATOR") return Role.EDUCATOR;
  if (role === "CLIENT") return Role.CLIENT;
  return undefined;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("CLERK_WEBHOOK_SECRET is not configured", {
      status: 500,
    });
  }

  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  try {
    if (event.type === "user.created") {
      await prisma.user.upsert({
        where: { clerkId: event.data.id },
        create: {
          clerkId: event.data.id,
          email: primaryEmail(event.data),
          name: displayName(event.data),
          phone: primaryPhone(event.data),
          role: Role.CLIENT,
        },
        update: {
          email: primaryEmail(event.data),
          name: displayName(event.data),
          phone: primaryPhone(event.data),
        },
      });
    }

    if (event.type === "user.updated") {
      const role = metadataRole(event.data.public_metadata);
      await prisma.user.upsert({
        where: { clerkId: event.data.id },
        create: {
          clerkId: event.data.id,
          email: primaryEmail(event.data),
          name: displayName(event.data),
          phone: primaryPhone(event.data),
          role: role ?? Role.CLIENT,
        },
        update: {
          email: primaryEmail(event.data),
          name: displayName(event.data),
          phone: primaryPhone(event.data),
          ...(role ? { role } : {}),
        },
      });
    }
  } catch {
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
