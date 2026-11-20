export interface ReviewItem {
  rating?: number;
  [key: string]: any; // TODO(types): Review item schema
}

export const getAverageRating = (reviews?: ReviewItem[] | null): number => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return sum / reviews.length;
};
