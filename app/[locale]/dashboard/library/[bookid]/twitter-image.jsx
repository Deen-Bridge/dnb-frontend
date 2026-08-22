import { getBookById } from "@/lib/actions/library/get-book";
import {
  renderOgCard,
  OG_IMAGE_SIZE,
} from "@/components/seo/renderOgCard";

export const runtime = "nodejs";
export const alt = "Deen Bridge book";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image({ params }) {
  const { bookid } = await params;

  let book = null;
  try {
    book = await getBookById(bookid);
  } catch {
    book = null;
  }

  const title = book?.title || "Discover books for your journey";
  const subtitle = book?.author?.name
    ? `By ${book.author.name}`
    : "A curated library of authentic Islamic books — on Deen Bridge.";
  const badge = book
    ? book.price
      ? `$${book.price} USDC`
      : "Free"
    : "Deen Bridge";

  return renderOgCard({ title, subtitle, badge });
}