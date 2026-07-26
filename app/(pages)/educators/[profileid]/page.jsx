import EducatorPageClient from "./EducatorPageClient";

export async function generateMetadata({ params }) {
  const { profileid } = await params;
  return {
    title: "Educator Profile - Deen Bridge",
    description: "View this educator's courses, books, and spaces on Deen Bridge.",
    openGraph: {
      title: "Educator Profile - Deen Bridge",
      description: "View this educator's courses, books, and spaces on Deen Bridge.",
      url: `https://deenbridge.com/educators/${profileid}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: "Educator Profile - Deen Bridge",
      description: "View this educator's courses, books, and spaces on Deen Bridge.",
    },
  };
}

export default function EducatorPage({ params }) {
  return <EducatorPageClient params={params} />;
}
