import { FaTwitter, FaGithub } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    id: "platform",
    links: [
      { id: "courses", href: "/dashboard/courses" },
      { id: "library", href: "/dashboard/library" },
      { id: "spaces", href: "/dashboard/spaces" },
      { id: "sadaqah", href: "/dashboard/sadaqah" },
      { id: "transparency", href: "/transparency" },
      { id: "ai", href: "/ai" },
    ],
  },
  {
    id: "company",
    links: [
      { id: "about", href: "/about" },
      { id: "features", href: "/features" },
      { id: "educators", href: "/educators" },
      { id: "blog", href: "/blog" },
      { id: "contact", href: "/contact" },
    ],
  },
  {
    id: "build",
    links: [
      { id: "stellar", href: "/stellar" },
      { id: "openSource", href: "https://github.com/Deen-Bridge" },
      { id: "becomeEducator", href: "/signup" },
    ],
  },
];

const socials = [
  {
    id: "github",
    icon: <FaGithub />,
    href: "https://github.com/Deen-Bridge",
  },
  {
    id: "x",
    icon: <FaTwitter />,
    href: "https://x.com/deen_bridge",
  },
];

export default function Footer() {
  const t = useTranslations("landing.footer");

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
              {t("tagline")}
            </p>

            <div className="flex items-center gap-3 text-xl">
              {socials.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(`socials.${s.id}`)}
                  className="rounded-full border border-secondary/25 p-2.5 transition-all hover:border-secondary hover:bg-secondary/10 hover:text-ink-inverse"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.id}>
              <h3
                className={cn(
                  poppins_600,
                  "mb-4 text-sm uppercase tracking-wider text-ink-inverse"
                )}
              >
                {t(`columns.${col.id}.heading`)}
              </h3>
              <ul className={cn(poppins_400, "space-y-3 text-sm")}>
                {col.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-ink-inverse-muted transition-colors duration-300 hover:text-ink-inverse"
                    >
                      {t(`columns.${col.id}.links.${link.id}`)}
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
          <p className="text-center md:text-start">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>

          {/* Stellar attribution — shows on every page that renders the footer */}
          <Link
            href="/stellar"
            aria-label={t("stellarAria")}
            className="inline-flex items-center gap-3 rounded-2xl bg-surface-raised px-4 py-2.5 shadow-lg transition-transform hover:scale-105"
          >
            <span
              className={cn(
                poppins_500,
                "text-[10px] uppercase tracking-wider text-ink-muted"
              )}
            >
              {t("builtOn")}
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
