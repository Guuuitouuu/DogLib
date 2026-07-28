import Link from "next/link";

import { EducatorFicheSectionCard } from "@/components/dashboard/educator-fiche-section-card";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  educatedDogsCount: number;
};

export function EducatorFicheEducatedDogsHintPanel({
  educatedDogsCount,
}: Props) {
  return (
    <EducatorFicheSectionCard
      title="Chiens accompagnés"
      description="Rempli automatiquement à partir de vos réservations (fiche publique)."
    >
      <p className="text-sm text-muted-foreground">
        {educatedDogsCount > 0
          ? `${educatedDogsCount} chien${educatedDogsCount > 1 ? "s" : ""} distinct${educatedDogsCount > 1 ? "s" : ""} issu${educatedDogsCount > 1 ? "s" : ""} de séances non annulées.`
          : "Les chiens que vous éduquez apparaîtront ici après vos premières réservations."}
      </p>
      <Link
        href="/dashboard/chiens"
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "mt-4 rounded-xl",
        })}
      >
        Voir les chiens suivis
      </Link>
    </EducatorFicheSectionCard>
  );
}
