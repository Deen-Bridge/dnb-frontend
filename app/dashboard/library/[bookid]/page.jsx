import { notFound } from "next/navigation";
import { getBookById } from '@/lib/actions/library/get-book';
import BookDetailPage from "./BookDetailPageClient";
export default async function Page({ params }) {
    const { bookid } = params;
    const book = await getBookById(bookid);
    if (!book) return notFound();
    return <BookDetailPage book={book} />;
}
