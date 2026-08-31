import {
  Archive,
  Baby,
  BookOpen,
  BookOpenText,
  Brain,
  BrainCircuit,
  Briefcase,
  CircleCheck,
  Compass,
  Cpu,
  Droplets,
  Feather,
  Flower2,
  Footprints,
  Gift,
  Globe,
  Handshake,
  Heart,
  HeartHandshake,
  Landmark,
  LibraryBig,
  Megaphone,
  MoonStar,
  Newspaper,
  Puzzle,
  Rocket,
  Scale,
  ScrollText,
  Shield,
  ShieldCheck,
  Shirt,
  Sparkles,
  Sunrise,
  UserPlus,
  Users,
} from "lucide-react";
import React from "react";
import { Course } from "@/types/api";

export type LucideIcon = React.ComponentType<any>; // TODO(types): Lucide icon component type

export const FALLBACK_SLUG = "other";

export interface CategoryItem {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  group?: string;
  groupId?: string;
}

export interface CategoryGroup {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  categories: CategoryItem[];
}

export const FALLBACK_CATEGORY: CategoryItem = {
  slug: FALLBACK_SLUG,
  label: "Other",
  shortLabel: "Other",
  group: "Other Categories",
  description:
    "Courses filed under categories that don't match the standard taxonomy.",
  icon: Puzzle,
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "core-islamic-sciences",
    label: "Core Islamic Sciences",
    description:
      "The foundational disciplines of Islamic knowledge, from revelation to jurisprudence.",
    icon: BookOpen,
    categories: [
      {
        slug: "quran-tafsir",
        label: "Qur'an & Tafsir",
        shortLabel: "Qur'an & Tafsir",
        description:
          "Understanding the Qur'an: recitation, memorisation, and exegesis.",
        icon: BookOpenText,
      },
      {
        slug: "hadith-sunnah",
        label: "Hadith & Sunnah",
        shortLabel: "Hadith & Sunnah",
        description:
          "The sayings, actions, and approvals of the Prophet (peace be upon him).",
        icon: ScrollText,
      },
      {
        slug: "fiqh",
        label: "Fiqh (Islamic Jurisprudence)",
        shortLabel: "Fiqh",
        description:
          "Practical rulings and Islamic law across the schools of jurisprudence.",
        icon: Scale,
      },
      {
        slug: "aqeedah",
        label: "Aqeedah (Islamic Creed/Belief)",
        shortLabel: "Aqeedah",
        description:
          "The fundamentals of Islamic belief and theology.",
        icon: Landmark,
      },
      {
        slug: "seerah",
        label: "Seerah (Life of the Prophet ﷺ)",
        shortLabel: "Seerah",
        description:
          "The life, character, and mission of Prophet Muhammad (peace be upon him).",
        icon: Footprints,
      },
      {
        slug: "usul-fiqh",
        label: "Usul al-Fiqh (Principles of Jurisprudence)",
        shortLabel: "Usul al-Fiqh",
        description:
          "The methodology used to derive legal rulings from their sources.",
        icon: LibraryBig,
      },
    ],
  },
  {
    id: "personal-development-spirituality",
    label: "Personal Development & Spirituality",
    description:
      "Tending to the heart: self-purification, character, and spiritual growth.",
    icon: Sparkles,
    categories: [
      {
        slug: "tazkiyah",
        label: "Tazkiyah (Self-Purification)",
        shortLabel: "Tazkiyah",
        description:
          "Purifying the soul and refining one's character and sincerity.",
        icon: Flower2,
      },
      {
        slug: "adab",
        label: "Islamic Manners (Adab)",
        shortLabel: "Adab",
        description:
          "Etiquette and proper conduct in daily life and worship.",
        icon: Handshake,
      },
      {
        slug: "duas-dhikr",
        label: "Duas & Dhikr",
        shortLabel: "Duas & Dhikr",
        description:
          "Supplications and remembrance of Allah for every occasion.",
        icon: Feather,
      },
      {
        slug: "islamic-mindfulness",
        label: "Islamic Mindfulness",
        shortLabel: "Islamic Mindfulness",
        description:
          "Presence, gratitude, and reflection from an Islamic perspective.",
        icon: Brain,
      },
      {
        slug: "islamic-psychology",
        label: "Islamic Psychology",
        shortLabel: "Islamic Psychology",
        description:
          "Mental wellbeing and psychology rooted in Islamic principles.",
        icon: BrainCircuit,
      },
    ],
  },
  {
    id: "daily-practice-worship",
    label: "Daily Practice & Worship",
    description:
      "The acts of worship that structure a Muslim's day and year.",
    icon: MoonStar,
    categories: [
      {
        slug: "salah",
        label: "Salah (Prayer)",
        shortLabel: "Salah",
        description:
          "The five daily prayers: learning, perfecting, and preserving them.",
        icon: MoonStar,
      },
      {
        slug: "fasting",
        label: "Fasting (Sawm)",
        shortLabel: "Fasting",
        description:
          "Fasting in Ramadan and beyond: rulings, benefits, and spirituality.",
        icon: Sunrise,
      },
      {
        slug: "zakah-charity",
        label: "Zakah & Charity",
        shortLabel: "Zakah & Charity",
        description:
          "Obligatory alms and the spirit of giving in Islam.",
        icon: Gift,
      },
      {
        slug: "hajj-umrah",
        label: "Hajj & Umrah",
        shortLabel: "Hajj & Umrah",
        description:
          "The pilgrimage: rituals, rulings, and spiritual preparation.",
        icon: Compass,
      },
      {
        slug: "taharah",
        label: "Purification (Taharah)",
        shortLabel: "Taharah",
        description:
          "Ritual purity, wudu, and ghusl in daily worship.",
        icon: Droplets,
      },
    ],
  },
  {
    id: "lifestyle-society",
    label: "Lifestyle & Society",
    description:
      "Living Islam in the family, marketplace, and wider society.",
    icon: Users,
    categories: [
      {
        slug: "marriage-family",
        label: "Marriage & Family",
        shortLabel: "Marriage & Family",
        description:
          "Marriage, rights, and building a family upon Islamic values.",
        icon: Heart,
      },
      {
        slug: "parenting",
        label: "Parenting",
        shortLabel: "Parenting",
        description:
          "Raising children with love, discipline, and imaan.",
        icon: Baby,
      },
      {
        slug: "islamic-finance",
        label: "Business & Finance (Islamic)",
        shortLabel: "Islamic Finance",
        description:
          "Halal earning, Islamic finance, and mindful money management.",
        icon: Briefcase,
      },
      {
        slug: "modesty-hijab",
        label: "Modesty & Hijab",
        shortLabel: "Modesty & Hijab",
        description:
          "Modesty in dress and conduct for both men and women.",
        icon: Shirt,
      },
      {
        slug: "halal-haram",
        label: "Halal & Haram",
        shortLabel: "Halal & Haram",
        description:
          "Distinguishing the permissible from the impermissible.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "ummah-global-topics",
    label: "Ummah & Global Topics",
    description:
      "The global Muslim community, its history, and today's big questions.",
    icon: Globe,
    categories: [
      {
        slug: "islamic-history",
        label: "Islamic History",
        shortLabel: "Islamic History",
        description:
          "The rich history of the Ummah, from the Prophet to the present.",
        icon: Archive,
      },
      {
        slug: "contemporary-issues",
        label: "Contemporary Issues",
        shortLabel: "Contemporary Issues",
        description:
          "Applying Islamic guidance to the issues Muslims face today.",
        icon: Newspaper,
      },
      {
        slug: "muslim-youth",
        label: "Muslim Youth",
        shortLabel: "Muslim Youth",
        description:
          "Identity, purpose, and growth for young Muslims.",
        icon: Rocket,
      },
      {
        slug: "dawah-outreach",
        label: "Dawah & Outreach",
        shortLabel: "Dawah & Outreach",
        description:
          "Inviting others to Islam with wisdom and beautiful conduct.",
        icon: Megaphone,
      },
      {
        slug: "islam-technology",
        label: "Islam & Technology",
        shortLabel: "Islam & Technology",
        description:
          "Faith and ethics at the intersection of technology and innovation.",
        icon: Cpu,
      },
    ],
  },
  {
    id: "audience-based",
    label: "Audience-Based",
    description:
      "Courses tailored to specific groups and stages of life.",
    icon: HeartHandshake,
    categories: [
      {
        slug: "new-muslims",
        label: "For New Muslims",
        shortLabel: "For New Muslims",
        description:
          "Foundational knowledge for those new to Islam.",
        icon: UserPlus,
      },
      {
        slug: "youth",
        label: "For Youth",
        shortLabel: "For Youth",
        description:
          "Engaging Islamic learning designed for young people.",
        icon: Rocket,
      },
      {
        slug: "sisters",
        label: "For Sisters",
        shortLabel: "For Sisters",
        description:
          "Courses curated for Muslim sisters.",
        icon: Heart,
      },
      {
        slug: "brothers",
        label: "For Brothers",
        shortLabel: "For Brothers",
        description:
          "Courses curated for Muslim brothers.",
        icon: Shield,
      },
      {
        slug: "children",
        label: "For Children",
        shortLabel: "For Children",
        description:
          "Fun, age-appropriate Islamic learning for kids.",
        icon: CircleCheck,
      },
    ],
  },
];

export const ISLAMIC_CATEGORIES: CategoryItem[] = CATEGORY_GROUPS.flatMap((group) =>
  group.categories.map((category) => ({
    ...category,
    group: group.label,
    groupId: group.id,
  }))
);

export const CATEGORY_MAP: Record<string, CategoryItem> = Object.fromEntries(
  ISLAMIC_CATEGORIES.map((category) => [category.slug, category])
);

const PAREN_STRIP = /\s*\([^)]*\)/g;

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u0640]/g, "")
    .trim();
}

export function slugify(value: unknown): string {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveCategorySlug(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return FALLBACK_SLUG;

  const direct = CATEGORY_MAP[slugify(raw)];
  if (direct) return direct.slug;

  const stripped = raw.replace(PAREN_STRIP, "").trim();
  if (stripped && stripped !== raw) {
    const viaStripped = CATEGORY_MAP[slugify(stripped)];
    if (viaStripped) return viaStripped.slug;
  }

  const lower = raw.toLowerCase();
  const byLabel = ISLAMIC_CATEGORIES.find(
    (category) => category.label.toLowerCase() === lower
  );
  if (byLabel) return byLabel.slug;

  console.warn(
    `[categories] Unknown course category "${raw}", bucketing under "${FALLBACK_SLUG}".`
  );
  return FALLBACK_SLUG;
}

export function getCategoryBySlug(slug?: string | null): CategoryItem | null {
  if (!slug) return null;
  if (slug === FALLBACK_SLUG) return FALLBACK_CATEGORY;
  return CATEGORY_MAP[slug] || null;
}

export function getCategoryLabel(slug?: string | null): string {
  const category = getCategoryBySlug(slug);
  return category ? category.label : "General";
}

export function getCategoryCounts(courses?: Partial<Course>[] | null): Record<string, number> {
  const counts: Record<string, number> = { [FALLBACK_SLUG]: 0 };
  for (const category of ISLAMIC_CATEGORIES) counts[category.slug] = 0;
  for (const course of courses || []) {
    const slug = resolveCategorySlug(course?.category);
    counts[slug] = (counts[slug] || 0) + 1;
  }
  return counts;
}

export function filterCoursesByCategory<T extends { category?: string }>(courses: T[] | null | undefined, slug?: string | null): T[] {
  const wanted = slug || FALLBACK_SLUG;
  return (courses || []).filter(
    (course) => resolveCategorySlug(course?.category) === wanted
  );
}

function createdAtOf(course?: any): number { // TODO(types): Partial course record
  if (course?.createdAt) {
    const parsed = new Date(course.createdAt).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }
  const id = course?._id;
  if (typeof id === "string" && id.length >= 8) {
    const seconds = parseInt(id.slice(0, 8), 16);
    if (!Number.isNaN(seconds)) return seconds * 1000;
  }
  return 0;
}

function priceOf(course?: any): number { // TODO(types): Partial course record
  return Number(course?.price) || 0;
}

function ratingOf(course?: any): number { // TODO(types): Partial course record with reviews
  const reviews = course?.reviews;
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0); // TODO(types): Course review item
  return sum / reviews.length;
}

export function sortCourses<T extends Partial<Course>>(courses: T[] | null | undefined, sortKey?: string): T[] {
  const list = [...(courses || [])];
  if (sortKey === "price-asc") {
    list.sort((a, b) => priceOf(a) - priceOf(b));
  } else if (sortKey === "price-desc") {
    list.sort((a, b) => priceOf(b) - priceOf(a));
  } else if (sortKey === "rating") {
    list.sort((a, b) => ratingOf(b) - ratingOf(a));
  } else {
    list.sort((a, b) => createdAtOf(b) - createdAtOf(a));
  }
  return list;
}
