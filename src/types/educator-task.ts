export type EducatorTaskTag = "relance" | "compte-rendu";

export type EducatorTaskItem = {
  id: string;
  label: string;
  detail: string;
  tag: EducatorTaskTag;
  href: string;
};
