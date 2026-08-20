"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import {
  FaWallet,
  FaBolt,
  FaShieldAlt,
  FaHandHoldingHeart,
} from "react-icons/fa";

const highlights = [
  {
    id: "usdc",
    icon: <FaWallet className="w-5 h-5 text-ink-inverse" />,
  },
  {
    id: "settles",
    icon: <FaBolt className="w-5 h-5 text-ink-inverse" />,
  },
  {
    id: "noncustodial",
    icon: <FaShieldAlt className="w-5 h-5 text-ink-inverse" />,
  },
  {
    id: "sadaqah",
    icon: <FaHandHoldingHeart className="w-5 h-5 text-ink-inverse" />,
  },
];

const figures = [
  { id: "settle", k: "~5s" },
  { id: "fee", k: "<$0.01" },
  { id: "stable", k: "USDC" },
  { id: "custodial", k: "100%" },
];

const StellarSection = () => {
  const t = useTranslations("landing.stellar");

  return (
    <section
      id="stellar"
      className="relative w-full overflow-hidden bg-basic py-20 sm:py-28 px-4 sm:px-6"
    >
      {/* Infrastructure-band treatment: glow plus a faint grid, so this reads as
          its own thing rather than another card section. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-accent/20 blur-2xl" />
        <div
          className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(0,153,0,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,153,0,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("badge.ariaLabel")}
              className="group mb-6 inline-flex items-center gap-3 rounded-2xl bg-surface-raised px-5 py-3 shadow-lg transition-transform hover:scale-105"
            >
              <span
                className={cn(
                  poppins_500,
                  "text-xs uppercase tracking-wider text-ink-muted"
                )}
              >
                {t("badge.builtOn")}
              </span>
              {/* Palette PNG with an opaque white background — multiply drops the
                  white into the chip so only the mark and wordmark show. */}
              <Image
                src="/images/images.png"
                alt="Stellar"
                width={738}
                height={228}
                className="h-6 w-auto mix-blend-multiply"
              />
            </Link>

            <h2
              className={cn(
                poppins_600,
                "mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-ink-inverse font-stretch-125%"
              )}
            >
              {t("heading.lead")}{" "}
              <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
                {t("heading.emphasis")}
              </span>
            </h2>

            <p
              className={cn(
                poppins_400,
                "mb-8 max-w-xl text-lg leading-relaxed text-ink-inverse-muted font-stretch-110%"
              )}
            >
              {t.rich("description", {
                network: (chunks) => (
                  <Link
                    href="https://stellar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:decoration-secondary"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                wide
                round
                to="/signup"
                className="bg-gradient-to-r from-secondary to-highlight hover:from-highlight hover:to-secondary text-white px-10 py-3.5 text-base font-bold animate-in-out transition-all shadow-lg"
              >
                {t("cta.primary")}
              </Button>
              <Link
                href="/stellar"
                className={cn(
                  poppins_500,
                  "rounded-full border border-secondary/40 px-8 py-3.5 text-base text-ink-inverse transition-all hover:border-secondary hover:bg-secondary/10"
                )}
              >
                {t("cta.secondary")}
              </Link>
            </div>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {highlights.map((h) => (
              <div
                key={h.id}
                className="group rounded-2xl border border-secondary/20 bg-gradient-to-br from-basic to-accent p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/20 transition-transform group-hover:scale-110">
                  {h.icon}
                </div>
                <h3
                  className={cn(
                    poppins_600,
                    "mb-2 text-base text-ink-inverse font-stretch-110%"
                  )}
                >
                  {t(`highlights.${h.id}.title`)}
                </h3>
                <p
                  className={cn(
                    poppins_400,
                    "text-sm leading-relaxed text-ink-inverse-muted"
                  )}
                >
                  {t(`highlights.${h.id}.desc`)}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Figures strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 gap-6 rounded-3xl border border-secondary/20 bg-secondary/5 p-8 backdrop-blur-sm sm:grid-cols-4"
        >
          {figures.map((f) => (
            <div key={f.id} className="text-center">
              <div
                className={cn(
                  poppins_600,
                  "mb-1 text-2xl sm:text-3xl text-secondary font-stretch-110%"
                )}
              >
                <span dir="ltr">{f.k}</span>
              </div>
              <div
                className={cn(
                  poppins_400,
                  "text-xs sm:text-sm text-ink-inverse-muted"
                )}
              >
                {t(`figures.${f.id}.label`)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StellarSection;
