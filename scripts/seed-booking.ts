import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { BookingStatus } = await import("../src/generated/prisma/client");
  const { parisSlotStartUtc, toParisDateString, addParisDays } = await import(
    "../src/lib/paris-time"
  );

  const educator = await prisma.educatorProfile.findFirst({
    include: {
      user: { select: { email: true, name: true } },
      services: { where: { isActive: true }, take: 1 },
    },
  });

  if (!educator) {
    console.log(JSON.stringify({ ok: false, error: "No educator profile" }));
    await prisma.$disconnect();
    return;
  }

  let client = await prisma.user.findFirst({
    where: { role: "CLIENT" },
    include: { dogs: { take: 1 } },
  });

  if (!client) {
    client = await prisma.user.create({
      data: {
        clerkId: `seed_client_${Date.now()}`,
        email: `client.seed.${Date.now()}@doglib.local`,
        name: "Client test DogLib",
        role: "CLIENT",
      },
      include: { dogs: true },
    });
  }

  let dog = client.dogs[0];
  if (!dog) {
    dog = await prisma.dog.create({
      data: {
        userId: client.id,
        name: "Rex",
        breed: "Berger",
        age: 3,
      },
    });
  }

  let service = educator.services[0];
  if (!service) {
    service = await prisma.service.create({
      data: {
        educatorProfileId: educator.id,
        title: "Réservation découverte",
        durationMinutes: 60,
        price: 5500,
        isActive: true,
      },
    });
  }

  const today = toParisDateString(new Date());
  const tomorrow = addParisDays(today, 1);
  const slotStart = parisSlotStartUtc(tomorrow, 10, 0);

  const existing = await prisma.booking.findFirst({
    where: {
      educatorProfileId: educator.id,
      dateTime: slotStart,
    },
  });

  if (existing) {
    console.log(
      JSON.stringify({
        ok: true,
        message: "Booking already exists",
        bookingId: existing.id,
        educatorProfileId: educator.id,
        dateTime: existing.dateTime.toISOString(),
        status: existing.status,
      }),
    );
    await prisma.$disconnect();
    return;
  }

  const booking = await prisma.booking.create({
    data: {
      userId: client.id,
      dogId: dog.id,
      serviceId: service.id,
      educatorProfileId: educator.id,
      dateTime: slotStart,
      status: BookingStatus.PENDING,
    },
  });

  const todaySlot = parisSlotStartUtc(today, 14, 0);
  const todayBooking =
    (await prisma.booking.findFirst({
      where: {
        educatorProfileId: educator.id,
        dateTime: todaySlot,
      },
    })) ??
    (await prisma.booking.create({
      data: {
        userId: client.id,
        dogId: dog.id,
        serviceId: service.id,
        educatorProfileId: educator.id,
        dateTime: todaySlot,
        status: BookingStatus.CONFIRMED,
      },
    }));

  console.log(
    JSON.stringify(
      {
        ok: true,
        educator: educator.user.email,
        educatorProfileId: educator.id,
        client: client.email,
        dog: dog.name,
        service: service.title,
        bookings: [
          {
            id: todayBooking.id,
            when: todayBooking.dateTime.toISOString(),
            status: todayBooking.status,
            label: "today dashboard",
          },
          {
            id: booking.id,
            when: booking.dateTime.toISOString(),
            status: booking.status,
            label: "tomorrow agenda",
          },
        ],
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
