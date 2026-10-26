export type CardVariant = "course" | "book";

export interface CardSkeletonDescriptor {
  id: string;
  variant: CardVariant;
  ariaBusy: true;
  aspectRatioClass: string;
  minHeightPx: number;
  lines: number;
}

export function buildCardSkeletonGrid(
  variant: CardVariant,
  count: number = 6
): CardSkeletonDescriptor[] {
  const safeCount = Math.max(1, Math.min(24, Math.trunc(count)));
  const isCourse = variant === "course";
  return Array.from({ length: safeCount }, (_, idx) => ({
    id: `${variant}-skeleton-${idx + 1}`,
    variant,
    ariaBusy: true,
    aspectRatioClass: isCourse ? "aspect-video" : "aspect-[3/4]",
    minHeightPx: isCourse ? 340 : 380,
    lines: isCourse ? 3 : 2,
  }));
}
