import Link from "next/link";

import { EducatorFicheSectionCard } from "@/components/dashboard/educator-fiche-section-card";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  activeServicesCount: number;
};

export function EducatorFicheServicesHintPanel({
  activeServicesCount,
}: Props) {
  return (
    <EducatorFicheSectionCard
      title="Prestations"
      description="Services proposés à la réservation sur votre fiche."
    >
      <p className="text-sm text-muted-foreground">
        {activeServicesCount > 0
          ? `${activeServicesCount} prestation${activeServicesCount > 1 ? "s" : ""} active${activeServicesCount > 1 ? "s" : ""} visible${activeServicesCount > 1 ? "s" : ""} par les propriétaires.`
          : "Publiez au moins une prestation pour activer le bouton « Réserver » sur votre vitrine."}
      </p>
      <Link
        href="/dashboard/services"
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "mt-4 rounded-xl",
        })}
      >
        Gérer mes services
      </Link>
    </EducatorFicheSectionCard>
  );
}
