import { cache } from "react";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/actions/library/get-book";
import BookDetailPage from "./BookDetailPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl, siteName } from "@/lib/config/site.config";
import { truncateText } from "@/lib/utils/seo";

// getBookById uses axios (not fetch), so React cache() deduplicates the call
// between generateMetadata and the page, keeping it to one backend hit.
const getBook = cache(getBookById);

export async function generateMetadata({ params }) {
  const { bookid } = await params;
  const book = await getBook(bookid);
  if (!book) return {};

  const title = `${book.title} | Deen Bridge`;
  const description = truncateText(book.description, 160) || `${book.title} — an authentic Islamic book on Deen Bridge.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/dashboard/library/${bookid}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/dashboard/library/${bookid}`,
      siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildBookJsonLd(book) {
  const reviews = Array.isArray(book.reviews) ? book.reviews : [];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: truncateText(book.description, 200) || undefined,
    author: book.author?.name
      ? { "@type": "Person", name: book.author.name }
      : { "@type": "Organization", name: siteName },
  };

  if (reviews.length > 0) {
    const avg =
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: reviews.length,
      bestRating: 5,
    };
  }

  return schema;
}

export default async function Page({ params }) {
  const { bookid } = await params;
  const book = await getBook(bookid);

  if (!book) return notFound();

  return (
    <>
      <JsonLd data={buildBookJsonLd(book)} />
      <BookDetailPage book={book} />
    </>
  );
}