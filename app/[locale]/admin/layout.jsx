import NextTopLoader from "nextjs-toploader";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** A lightweight shell for the localized admin route segment. */
export default function AdminLayout({ children }) {
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
