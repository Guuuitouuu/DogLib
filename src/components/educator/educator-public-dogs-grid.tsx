import Image from "next/image";
import { Dog } from "lucide-react";

import type { EducatorPublicDogItem } from "@/actions/booking";
import { resolveDogPhotoSrc } from "@/lib/dog-photo";

type Props = {
  dogs: EducatorPublicDogItem[];
};

export function EducatorPublicDogsGrid({ dogs }: Props) {
  if (dogs.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Aucun chien à afficher pour le moment.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {dogs.map((dog) => {
        const photoSrc = resolveDogPhotoSrc(dog.id, dog.photoUrl);
        const external = photoSrc.startsWith("http");

        return (
          <li
            key={dog.id}
            className="flex flex-col items-center rounded-2xl border border-border bg-background/50 p-4 text-center"
          >
            <div className="size-20 overflow-hidden rounded-full border-2 border-card ring-1 ring-border">
              <Image
                src={photoSrc}
                alt=""
                width={80}
                height={80}
                className="size-full object-cover"
                unoptimized={external}
              />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">{dog.name}</p>
            {dog.breed ? (
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Dog className="size-3 text-primary" aria-hidden />
                {dog.breed}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
