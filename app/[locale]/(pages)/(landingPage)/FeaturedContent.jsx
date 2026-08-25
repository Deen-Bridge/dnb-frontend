"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  Radio,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { Marquee } from "@/components/ui/marquee";

// Static showcase data. Fields mirror the shapes returned by
// fetchCourses() / fetchBooks() / getSpaces() so these rows can be swapped
// for live data without reworking the card markup. Translatable text
// (title/description/category/personName/level/when) lives in the message
// catalog keyed by item id and is read inside the component via `t`.
const COURSES = [
  { id: "c1", price: 45, lessons: 24 },
  { id: "c2", price: 30, lessons: 18 },
  { id: "c3", price: 55, lessons: 32 },
  { id: "c4", price: 60, lessons: 40 },
  { id: "c5", price: 0, lessons: 16 },
  { id: "c6", price: 75, lessons: 22 },
];

const BOOKS = [
  { id: "b1", price: 0, rating: 4.9, readCount: 1904 },
  { id: "b2", price: 12, rating: 4.8, readCount: 1327 },
  { id: "b3", price: 9, rating: 4.7, readCount: 842 },
  { id: "b4", price: 0, rating: 5.0, readCount: 2611 },
  { id: "b5", price: 11, rating: 4.8, readCount: 1580 },
  { id: "b6", price: 8, rating: 4.6, readCount: 673 },
];

const SPACES = [
  { id: "s1", status: "live", duration: 60 },
  { id: "s2", status: "upcoming", duration: 90 },
  { id: "s3", status: "upcoming", duration: 45 },
  { id: "s4", status: "live", duration: 60 },
  { id: "s5", status: "upcoming", duration: 75 },
  { id: "s6", status: "upcoming", duration: 60 },
];

const formatPrice = (price, t) => (price > 0 ? `$${price}` : t("free"));

const formatDuration = (minutes, t) => {
  if (minutes < 60) return t("duration.mins", { count: minutes });
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0
    ? t("duration.hr", { count: hours })
    : t("duration.hrMin", { hours, mins });
};

// Rows are separated by weight within the single green hue — no second
// accent colour anywhere on this section. Directions alternate.
const ROWS = [
  {
    key: "courses",
    icon: GraduationCap,
    items: COURSES,
    reverse: false,
    duration: "100s",
    tone: {
      chip: "bg-secondary/10 text-accent",
      byline: "text-highlight",
      edge: "from-secondary to-accent",
    },
    meta: (item, t) => [
      { icon: Sparkles, text: formatPrice(item.price, t) },
      { icon: BookOpen, text: t("lessons", { count: item.lessons }) },
      { icon: Users, text: t(`courses.${item.id}.level`) },
    ],
    byline: (item, t) => t(`courses.${item.id}.personName`),
  },
  {
    key: "books",
    icon: BookOpen,
    items: BOOKS,
    reverse: true,
    duration: "140s",
    tone: {
      chip: "bg-highlight/15 text-basic",
      byline: "text-accent",
      edge: "from-highlight to-basic",
    },
    meta: (item, t) => [
      { icon: Sparkles, text: formatPrice(item.price, t) },
      { icon: Star, text: item.rating.toFixed(1) },
      { icon: Users, text: t("reads", { count: item.readCount }) },
    ],
    byline: (item, t) => t(`books.${item.id}.personName`),
  },
  {
    key: "spaces",
    icon: Radio,
    items: SPACES,
    reverse: false,
    duration: "120s",
    tone: {
      chip: "bg-secondary/10 text-highlight",
      byline: "text-secondary",
      edge: "from-secondary to-highlight",
    },
    meta: (item, t) => [
      { icon: CalendarDays, text: t(`spaces.${item.id}.when`) },
      { icon: Clock3, text: formatDuration(item.duration, t) },
    ],
    byline: (item, t) => t(`spaces.${item.id}.personName`),
  },
];

const ContentCard = ({ item, row }) => {
  const t = useTranslations("landing.featured");
  const RowIcon = row.icon;

  return (
    <article className="mx-3 w-[330px] shrink-0">
      <div className="group relative h-full overflow-hidden rounded-2xl border border-accent/15 bg-surface-raised p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-secondary hover:shadow-xl">
        {/* Accent edge */}
        <span
          className={cn(
            "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-70 transition-opacity group-hover:opacity-100",
            row.tone.edge
          )}
        />

        {/* Category + live badge */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className={cn(
              poppins_500,
              "inline-flex max-w-[190px] items-center gap-1.5 rounded-lg px-3 py-1 text-xs",
              row.tone.chip
            )}
          >
            <RowIcon className="size-3 shrink-0" />
            <span className="truncate">
              {t(`${row.key}.${item.id}.category`)}
            </span>
          </span>
          {item.status === "live" && (
            <span
              className={cn(
                poppins_600,
                "inline-flex shrink-0 items-center gap-1 rounded-lg bg-highlight px-2 py-1 text-[10px] tracking-wide text-surface-raised uppercase"
              )}
            >
              <span className="size-1.5 animate-pulse rounded-full bg-surface-raised" />
              {t("live")}
            </span>
          )}
        </div>

        <h3
          className={cn(
            poppins_600,
            "mb-2 line-clamp-1 text-xl text-ink font-stretch-110%"
          )}
        >
          {t(`${row.key}.${item.id}.title`)}
        </h3>

        <p className={cn(poppins_500, "mb-1 text-xs", row.tone.byline)}>
          {row.byline(item, t)}
        </p>

        <p
          className={cn(
            poppins_400,
            "mb-6 line-clamp-2 text-sm leading-relaxed text-ink-muted font-stretch-110%"
          )}
        >
          {t(`${row.key}.${item.id}.description`)}
        </p>

        <div className="flex items-center gap-2">
          {row.meta(item, t).map(({ icon: MetaIcon, text }) => (
            <span
              key={text}
              className={cn(
                poppins_500,
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap",
                row.tone.chip
              )}
            >
              <MetaIcon className="size-3.5 shrink-0" />
              <span className="max-w-[84px] truncate">{text}</span>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

const FeaturedContent = () => {
  const t = useTranslations("landing.featured");

  return (
    <section
      id="explore"
      className="relative w-full overflow-hidden bg-surface py-20 sm:py-28"
    >
      {/* Decorative motif — green on white, same treatment as WhyDeenBridge */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute start-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-secondary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 end-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-accent/10 to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              poppins_500,
              "mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-secondary/10 px-4 py-1.5 text-sm text-accent"
            )}
          >
            <Sparkles className="size-3.5" />
            {t("eyebrow")}
          </motion.div>

          {/* Same gradient as the Hero wordmark */}
          <h2
            className={cn(
              poppins_600,
              "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl font-stretch-125%"
            )}
          >
            {t("heading")}
          </h2>

          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl font-stretch-110%"
            )}
          >
            {t("intro")}
          </p>
        </motion.div>

        {/* Marquee rows — one per content type, alternating direction */}
        <div className="space-y-10">
          {ROWS.map((row) => {
            const RowIcon = row.icon;

            return (
              <div key={row.key}>
                <div className="mb-4 flex items-center gap-3 px-1">
                  <span
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-xl",
                      row.tone.chip
                    )}
                  >
                    <RowIcon className="size-4" />
                  </span>
                  <div className="text-start">
                    <h3
                      className={cn(
                        poppins_600,
                        "text-base text-ink font-stretch-110%"
                      )}
                    >
                      {t(`rows.${row.key}.label`)}
                    </h3>
                    <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                      {t(`rows.${row.key}.tagline`)}
                    </p>
                  </div>
                </div>

                {/* Fade the edges so cards enter and leave softly */}
                <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
                  <Marquee
                    pauseOnHover
                    reverse={row.reverse}
                    style={{ "--duration": row.duration }}
                  >
                    {row.items.map((item) => (
                      <ContentCard key={item.id} item={item} row={row} />
                    ))}
                  </Marquee>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedContent;
