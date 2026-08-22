import { cache } from "react";
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/users/getUserById";
import EducatorPageClient from "./EducatorPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl, siteName } from "@/lib/config/site.config";
import { truncateText } from "@/lib/utils/seo";

// getUserById uses axios (not fetch), so React cache() deduplicates the call
// between generateMetadata and the page, keeping it to one backend hit.
const getEducator = cache(getUserById);

async function resolveEducator(profileid) {
  const res = await getEducator(profileid);
  return res?.user || null;
}

export async function generateMetadata({ params }) {
  const { profileid } = await params;
  const educator = await resolveEducator(profileid);
  if (!educator) return {};

  const name = educator.name || "Educator";
  const title = `${name} | Deen Bridge`;
  const description =
    truncateText(educator.bio, 160) ||
    `Learn from ${name} — courses, books and live spaces on Deen Bridge.`;
  const nameParts = name.split(/\s+/).filter(Boolean);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/educators/${profileid}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/educators/${profileid}`,
      siteName,
      locale: "en_US",
      type: "profile",
      profile: {
        firstName: nameParts[0] || undefined,
        lastName: nameParts.slice(1).join(" ") || undefined,
        username: profileid,
      },
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildProfileJsonLd(educator, profileid) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: educator.name,
      url: `${siteUrl}/educators/${profileid}`,
      description: truncateText(educator.bio, 200) || undefined,
      image: educator.avatar || undefined,
    },
  };
}

export default async function EducatorPage({ params }) {
  const { profileid } = await params;
  const educator = await resolveEducator(profileid);

  if (!educator) return notFound();

  return (
    <>
      <JsonLd data={buildProfileJsonLd(educator, profileid)} />
      <EducatorPageClient params={params} educator={educator} />
    </>
  );
}