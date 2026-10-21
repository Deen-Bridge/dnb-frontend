import NextTopLoader from "nextjs-toploader";
import AdminNavigation from "@/components/admin/AdminNavigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <NextTopLoader color="#7c3aed" showSpinner={false} />
      <div className="flex min-h-screen flex-col bg-muted/20 lg:flex-row">
        <AdminNavigation />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
}
