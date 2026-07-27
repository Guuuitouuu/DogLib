"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MarketplaceFilterOptions } from "@/types/marketplace";

const ALL = "__all__";

type MarketplaceFiltersProps = {
  options: MarketplaceFilterOptions;
  initialQ?: string;
  initialCity?: string;
  initialSpecialty?: string;
};

export function MarketplaceFilters({
  options,
  initialQ = "",
  initialCity = "",
  initialSpecialty = "",
}: MarketplaceFiltersProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState(initialCity || ALL);
  const [specialty, setSpecialty] = useState(initialSpecialty || ALL);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmedQ = q.trim();
    if (trimmedQ) params.set("q", trimmedQ);
    if (city && city !== ALL) params.set("city", city);
    if (specialty && specialty !== ALL) params.set("specialty", specialty);
    const query = params.toString();
    router.push(query ? `/recherche?${query}` : "/recherche");
  }

  function resetFilters() {
    setQ("");
    setCity(ALL);
    setSpecialty(ALL);
    router.push("/recherche");
  }

  return (
    <form
      onSubmit={applyFilters}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="marketplace-q">Recherche</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="marketplace-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom de l’éducateur ou ville…"
              className="pl-9"
              maxLength={120}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="marketplace-city">Ville</Label>
          <Select
            value={city}
            onValueChange={(value) => setCity(value ?? ALL)}
          >
            <SelectTrigger id="marketplace-city" className="w-full">
              <SelectValue placeholder="Toutes les villes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les villes</SelectItem>
              {options.cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="marketplace-specialty">Spécialité</Label>
          <Select
            value={specialty}
            onValueChange={(value) => setSpecialty(value ?? ALL)}
          >
            <SelectTrigger id="marketplace-specialty" className="w-full">
              <SelectValue placeholder="Tous les services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous les services</SelectItem>
              {options.specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">Appliquer</Button>
        <Button type="button" variant="outline" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>
    </form>
  );
}
