import { FaTwitter, FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    heading: "Platform",
    links: [
      { name: "Courses", href: "/dashboard/courses" },
      { name: "Library", href: "/dashboard/library" },
      { name: "Community Spaces", href: "/dashboard/spaces" },
      { name: "Sadaqah Fund", href: "/dashboard/sadaqah" },
      { name: "Sadaqah Transparency", href: "/transparency" },
      { name: "AI Assistant", href: "/ai" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Features", href: "/features" },
      { name: "Educators", href: "/educators" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Build",
    links: [
      { name: "Payments on Stellar", href: "/stellar" },
      { name: "Open Source", href: "https://github.com/Deen-Bridge" },
      { name: "Become an Educator", href: "/signup" },
    ],
  },
];

const socials = [
  {
    icon: <FaGithub />,
    href: "https://github.com/Deen-Bridge",
    label: "Deen Bridge on GitHub",
  },
  {
    icon: <FaTwitter />,
    href: "https://x.com/deen_bridge",
    label: "Deen Bridge on X",
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative bg-basic text-ink-inverse overflow-hidden"
    >
      {/* Glowing Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-accent to-secondary opacity-30 blur-2xl z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="mb-12 grid grid-cols-2 gap-10 gap-y-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/dnb-nobg.png"
                alt="Deen Bridge"
                width={225}
                height={225}
                className="size-12 w-auto"
              />
              <span
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-2xl text-transparent font-stretch-125% sm:text-3xl"
                )}
              >
                Deen Bridge
              </span>
            </Link>

            <p
              className={cn(
                poppins_400,
                "mb-6 max-w-sm text-sm leading-relaxed text-ink-inverse-muted"
              )}
            >
              A trusted home for learners and educators across the Ummah.
              Authentic courses, a growing library, and live spaces — built in
              the open, and paid out on Stellar.
            </p>

            <div className="flex items-center gap-3 text-xl">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded-full border border-secondary/25 p-2.5 transition-all hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3
                className={cn(
                  poppins_600,
                  "mb-4 text-sm uppercase tracking-wider text-secondary"
                )}
              >
                {col.heading}
              </h3>
              <ul className={cn(poppins_400, "space-y-3 text-sm")}>
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-ink-inverse-muted transition-colors duration-300 hover:text-secondary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className={cn(
            poppins_400,
            "flex flex-col-reverse items-center justify-between gap-6 border-t border-accent/40 pt-6 text-sm text-ink-inverse-muted md:flex-row"
          )}
        >
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Deen Bridge. All rights reserved.
          </p>

          {/* Stellar attribution — shows on every page that renders the footer */}
          <Link
            href="/stellar"
            aria-label="Learn how Deen Bridge uses the Stellar network"
            className="inline-flex items-center gap-3 rounded-2xl bg-surface-raised px-4 py-2.5 shadow-lg transition-transform hover:scale-105"
          >
            <span
              className={cn(
                poppins_500,
                "text-[10px] uppercase tracking-wider text-ink-muted"
              )}
            >
              Built on
            </span>
            {/* Opaque-white PNG — multiply drops the background into the chip. */}
            <Image
              src="/images/images.png"
              alt="Stellar"
              width={738}
              height={228}
              className="h-5 w-auto mix-blend-multiply"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
