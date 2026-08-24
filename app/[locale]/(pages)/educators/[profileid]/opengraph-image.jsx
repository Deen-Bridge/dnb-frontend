import { getUserById } from "@/lib/actions/users/getUserById";
import {
  renderOgCard,
  OG_IMAGE_SIZE,
} from "@/components/seo/renderOgCard";
import { truncateText } from "@/lib/utils/seo";

export const runtime = "nodejs";
export const alt = "Educator on Deen Bridge";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image({ params }) {
  const { profileid } = await params;

  let educator = null;
  try {
    const res = await getUserById(profileid);
    educator = res?.user || null;
  } catch {
    educator = null;
  }

  const title = educator?.name || "Meet an educator on Deen Bridge";
  const subtitle =
    truncateText(educator?.bio, 140) ||
    "Courses, books and live spaces from a verified educator — on Deen Bridge.";
  const badge = educator?.isVerified
    ? "Verified Educator"
    : "Educator on Deen Bridge";

  return renderOgCard({ title, subtitle, badge, typeLabel: "EDUCATOR" });
}