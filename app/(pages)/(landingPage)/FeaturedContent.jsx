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
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";
import { Marquee } from "@/components/ui/marquee";

// Static showcase data. Fields mirror the shapes returned by
// fetchCourses() / fetchBooks() / getSpaces() so these rows can be swapped
// for live data without reworking the card markup.
const COURSES = [
  {
    id: "c1",
    title: "Tajweed from the Ground Up",
    description:
      "Master the rules of recitation with guided drills and weekly feedback from your instructor.",
    category: "Qur’an & Tafsir",
    price: 45,
    instructor: "Ustadh Bilal Rahman",
    lessons: 24,
    level: "Beginner",
  },
  {
    id: "c2",
    title: "The Fiqh of Salah",
    description:
      "Pray with certainty — conditions, pillars, and the common mistakes that invalidate prayer.",
    category: "Salah (Prayer)",
    price: 30,
    instructor: "Shaykh Idris Ali",
    lessons: 18,
    level: "Beginner",
  },
  {
    id: "c3",
    title: "Seerah: The Makkan Years",
    description:
      "Walk through the first thirteen years of revelation and the lessons they hold for us today.",
    category: "Seerah (Life of the Prophet ﷺ)",
    price: 55,
    instructor: "Dr. Amina Yusuf",
    lessons: 32,
    level: "Intermediate",
  },
  {
    id: "c4",
    title: "Arabic for Qur’an Readers",
    description:
      "Build the grammar and vocabulary you need to follow the Qur’an without a translation.",
    category: "Qur’an & Tafsir",
    price: 60,
    instructor: "Ustadha Khadijah Sani",
    lessons: 40,
    level: "Intermediate",
  },
  {
    id: "c5",
    title: "Aqeedah Essentials",
    description:
      "A clear foundation in Islamic creed, grounded in the Qur’an and authentic Sunnah.",
    category: "Aqeedah (Islamic Creed/Belief)",
    price: 0,
    instructor: "Shaykh Musa Abdullah",
    lessons: 16,
    level: "Beginner",
  },
  {
    id: "c6",
    title: "Islamic Finance in Practice",
    description:
      "Halal earning, riba-free contracts, and how to structure everyday transactions.",
    category: "Business & Finance (Islamic)",
    price: 75,
    instructor: "Dr. Nasir Haruna",
    lessons: 22,
    level: "Advanced",
  },
];

const BOOKS = [
  {
    id: "b1",
    title: "Gardens of the Righteous",
    description:
      "A curated collection of hadith on character, worship, and daily conduct.",
    category: "Hadith & Sunnah",
    author: "Imam an-Nawawi",
    price: 0,
    rating: 4.9,
    readCount: 1904,
  },
  {
    id: "b2",
    title: "The Sealed Nectar",
    description:
      "An award-winning biography of the Prophet ﷺ, from lineage to final sermon.",
    category: "Seerah (Life of the Prophet ﷺ)",
    author: "S. al-Mubarakpuri",
    price: 12,
    rating: 4.8,
    readCount: 1327,
  },
  {
    id: "b3",
    title: "Purification of the Heart",
    description:
      "Diagnosing and treating the spiritual diseases that hold the heart back.",
    category: "Tazkiyah (Self-Purification)",
    author: "Hamza Yusuf",
    price: 9,
    rating: 4.7,
    readCount: 842,
  },
  {
    id: "b4",
    title: "Fortress of the Muslim",
    description:
      "Authentic supplications for every moment of the day, with transliteration.",
    category: "Duas & Dhikr",
    author: "Sa‘id al-Qahtani",
    price: 0,
    rating: 5.0,
    readCount: 2611,
  },
  {
    id: "b5",
    title: "Reclaim Your Heart",
    description:
      "Reflections on attachment, loss, and returning to Allah with a whole heart.",
    category: "Islamic Mindfulness",
    author: "Yasmin Mogahed",
    price: 11,
    rating: 4.8,
    readCount: 1580,
  },
  {
    id: "b6",
    title: "Raising Believers",
    description:
      "A practical guide to nurturing faith, adab, and confidence in Muslim children.",
    category: "Parenting",
    author: "Umm Sulaym Adeyemi",
    price: 8,
    rating: 4.6,
    readCount: 673,
  },
];

const SPACES = [
  {
    id: "s1",
    title: "Tafsir Circle: Surah Al-Kahf",
    description:
      "A live weekly reading through the surah of light, trials, and patience.",
    category: "Qur’an & Tafsir",
    host: "Ustadh Bilal Rahman",
    status: "live",
    when: "Now",
    duration: 60,
  },
  {
    id: "s2",
    title: "Ask a Scholar: Marriage & Family",
    description:
      "Bring your questions on marriage, in-laws, and raising a household on the Sunnah.",
    category: "Marriage & Family",
    host: "Shaykh Idris Ali",
    status: "upcoming",
    when: "Thu, 8:00 PM",
    duration: 90,
  },
  {
    id: "s3",
    title: "New Muslim Welcome Session",
    description:
      "A gentle first step — the basics of worship and a community to lean on.",
    category: "For New Muslims",
    host: "Sr. Maryam Okoye",
    status: "upcoming",
    when: "Sat, 4:00 PM",
    duration: 45,
  },
  {
    id: "s4",
    title: "Youth Halaqah: Staying Firm",
    description:
      "Holding onto your Deen at school, at work, and everywhere online.",
    category: "Muslim Youth",
    host: "Ustadh Yahya Bello",
    status: "live",
    when: "Now",
    duration: 60,
  },
  {
    id: "s5",
    title: "Sisters’ Circle: Tazkiyah",
    description:
      "A safe space for sisters to study self-purification and grow together.",
    category: "For Sisters",
    host: "Ustadha Khadijah Sani",
    status: "upcoming",
    when: "Sun, 6:30 PM",
    duration: 75,
  },
  {
    id: "s6",
    title: "Dawah in the Digital Age",
    description:
      "Carrying the message with wisdom on the platforms people actually use.",
    category: "Islam & Technology",
    host: "Dr. Nasir Haruna",
    status: "upcoming",
    when: "Mon, 7:00 PM",
    duration: 60,
  },
];

const formatPrice = (price) => (price > 0 ? `$${price}` : "Free");

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
};

// Rows are separated by weight within the single green hue — no second
// accent colour anywhere on this section. Directions alternate.
const ROWS = [
  {
    key: "courses",
    label: "Courses",
    tagline: "Structured learning, taught live",
    icon: GraduationCap,
    items: COURSES,
    reverse: false,
    duration: "100s",
    tone: {
      chip: "bg-secondary/10 text-accent",
      byline: "text-highlight",
      edge: "from-secondary to-accent",
    },
    meta: (item) => [
      { icon: Sparkles, text: formatPrice(item.price) },
      { icon: BookOpen, text: `${item.lessons} lessons` },
      { icon: Users, text: item.level },
    ],
    byline: (item) => item.instructor,
  },
  {
    key: "books",
    label: "Library",
    tagline: "Read, annotate, and keep",
    icon: BookOpen,
    items: BOOKS,
    reverse: true,
    duration: "140s",
    tone: {
      chip: "bg-highlight/15 text-basic",
      byline: "text-accent",
      edge: "from-highlight to-basic",
    },
    meta: (item) => [
      { icon: Sparkles, text: formatPrice(item.price) },
      { icon: Star, text: item.rating.toFixed(1) },
      { icon: Users, text: `${item.readCount.toLocaleString()} reads` },
    ],
    byline: (item) => item.author,
  },
  {
    key: "spaces",
    label: "Spaces",
    tagline: "Live gatherings for the Ummah",
    icon: Radio,
    items: SPACES,
    reverse: false,
    duration: "120s",
    tone: {
      chip: "bg-secondary/10 text-highlight",
      byline: "text-secondary",
      edge: "from-secondary to-highlight",
    },
    meta: (item) => [
      { icon: CalendarDays, text: item.when },
      { icon: Clock3, text: formatDuration(item.duration) },
    ],
    byline: (item) => item.host,
  },
];

const ContentCard = ({ item, row }) => {
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
            <span className="truncate">{item.category}</span>
          </span>
          {item.status === "live" && (
            <span
              className={cn(
                poppins_600,
                "inline-flex shrink-0 items-center gap-1 rounded-lg bg-highlight px-2 py-1 text-[10px] tracking-wide text-surface-raised uppercase"
              )}
            >
              <span className="size-1.5 animate-pulse rounded-full bg-surface-raised" />
              Live
            </span>
          )}
        </div>

        <h3
          className={cn(
            poppins_600,
            "mb-2 line-clamp-1 text-xl text-ink font-stretch-110%"
          )}
        >
          {item.title}
        </h3>

        <p className={cn(poppins_500, "mb-1 text-xs", row.tone.byline)}>
          {row.byline(item)}
        </p>

        <p
          className={cn(
            poppins_400,
            "mb-6 line-clamp-2 text-sm leading-relaxed text-ink-muted font-stretch-110%"
          )}
        >
          {item.description}
        </p>

        <div className="flex items-center gap-2">
          {row.meta(item).map(({ icon: MetaIcon, text }) => (
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
  return (
    <section
      id="explore"
      className="relative w-full overflow-hidden bg-surface py-20 sm:py-28"
    >
      {/* Decorative motif — green on white, same treatment as WhyDeenBridge */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-secondary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-accent/10 to-transparent blur-2xl" />
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
            Explore the Platform
          </motion.div>

          {/* Same gradient as the Hero wordmark */}
          <h2
            className={cn(
              poppins_600,
              "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl font-stretch-125%"
            )}
          >
            Courses, Books &amp; Spaces
          </h2>

          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl font-stretch-110%"
            )}
          >
            Authentic knowledge, curated by scholars and trusted teachers. Learn
            at your own pace, read from a growing library, and gather live with
            the Ummah.
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
                  <div className="text-left">
                    <h3
                      className={cn(
                        poppins_600,
                        "text-base text-ink font-stretch-110%"
                      )}
                    >
                      {row.label}
                    </h3>
                    <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                      {row.tagline}
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
