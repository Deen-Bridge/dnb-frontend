import { ImageResponse } from "next/og";
import { OgBrandCard } from "./OgBrandCard";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * Renders an ImageResponse social card. Shared by the opengraph-image and
 * twitter-image routes for courses and books.
 */
export function renderOgCard({ title, subtitle, badge, typeLabel }) {
  return new ImageResponse(
    <OgBrandCard
      title={title}
      subtitle={subtitle}
      badge={badge}
      typeLabel={typeLabel}
    />,
    OG_IMAGE_SIZE
  );
}