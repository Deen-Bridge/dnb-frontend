import { notFound } from "next/navigation";
import { getBookById } from "@/lib/actions/library/get-book";
import BookReaderClient from "./BookReaderClient";

export default async function Page({ params }) {
  const { bookid } = await params;

  try {
    const book = await getBookById(bookid);
    if (!book) {
      return notFound();
    }

    return <BookReaderClient book={book} />;
  } catch (_error) {
    return notFound();
  }
}

