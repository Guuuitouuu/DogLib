import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardAidePage() {
  return (
    <>
      <Topbar eyebrow="Support DogLib" title="Aide" />
      <main className="flex-1 px-5 py-6 md:px-8">
        <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Documentation et contact support — à venir.
        </p>
      </main>
    </>
  );
}
