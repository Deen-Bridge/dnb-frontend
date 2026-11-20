import NextTopLoader from "nextjs-toploader";
import { requireAdminRoute } from "@/lib/auth/admin-route";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** A lightweight shell for the localized admin route segment. */
export default async function AdminLayout({ children, params }) {
  const { locale } = await params;
  await requireAdminRoute(locale);

  return (
    <>
      <NextTopLoader
        color="#009900"
        initialPosition={0.09}
        crawlSpeed={100}
        height={3}
        crawl={false}
        showSpinner={false}
        easing="ease"
        speed={100}
        shadow="0 0 10px #009900,0 0 5px #009900"
      />
      <div className="min-h-dvh">{children}</div>
    </>
  );
}
