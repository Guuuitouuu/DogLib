import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EducatorFicheSectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function EducatorFicheSectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: EducatorFicheSectionCardProps) {
  return (
    <Card className={cn("rounded-3xl shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
