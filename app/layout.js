import "../styles/globals.css";

export const metadata = {
  title: "Deen Bridge",
  description: "Islamic education platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
