/**
 * lib/categories.js
 *
 * Single source of truth for the Islamic course category taxonomy.
 * All pages and components import slugs, labels, groups, descriptions, and
 * icons from here — never from lib/data.js or local constants.
 *
 * Backend integration note:
 *   When the backend ships GET /api/courses/categories (returning
 *   [{ slug, count }]), replace `getCategoryCounts` below with a real fetch
 *   and the rest of this module stays untouched.
 */

// ---------------------------------------------------------------------------
// 1. Flat category list (canonical)
// ---------------------------------------------------------------------------

/** @typedef {{ slug: string, label: string, group: string, description: string, icon: string }} Category */

/** @type {Category[]} */
export const CATEGORIES = [
  // ── Core Islamic Sciences ─────────────────────────────────────────────────
  {
    slug: "quran-tafsir",
    label: "Qur'an & Tafsir",
    group: "Core Islamic Sciences",
    description: "Deep study of the Qur'an, its meanings, and exegesis.",
    icon: "📖",
  },
  {
    slug: "hadith-sunnah",
    label: "Hadith & Sunnah",
    group: "Core Islamic Sciences",
    description: "The prophetic traditions — collection, sciences, and fiqh.",
    icon: "📜",
  },
  {
    slug: "fiqh",
    label: "Fiqh (Islamic Jurisprudence)",
    group: "Core Islamic Sciences",
    description: "Islamic law covering worship, transactions, and everyday life.",
    icon: "⚖️",
  },
  {
    slug: "aqeedah",
    label: "Aqeedah (Islamic Creed)",
    group: "Core Islamic Sciences",
    description: "Islamic theology, belief in Allah, His names and attributes.",
    icon: "🕌",
  },
  {
    slug: "seerah",
    label: "Seerah (Life of the Prophet ﷺ)",
    group: "Core Islamic Sciences",
    description: "Biography of the Prophet Muhammad ﷺ and his companions.",
    icon: "🌙",
  },
  {
    slug: "usul-al-fiqh",
    label: "Usul al-Fiqh",
    group: "Core Islamic Sciences",
    description: "Principles and methodology of Islamic jurisprudence.",
    icon: "📚",
  },

  // ── Personal Development & Spirituality ──────────────────────────────────
  {
    slug: "tazkiyah",
    label: "Tazkiyah (Self-Purification)",
    group: "Personal Development & Spirituality",
    description: "Purifying the soul and drawing closer to Allah.",
    icon: "✨",
  },
  {
    slug: "islamic-manners",
    label: "Islamic Manners (Adab)",
    group: "Personal Development & Spirituality",
    description: "Etiquette, character, and conduct in Islam.",
    icon: "🤝",
  },
  {
    slug: "duas-dhikr",
    label: "Duas & Dhikr",
    group: "Personal Development & Spirituality",
    description: "Supplications, remembrance of Allah, and their virtues.",
    icon: "🤲",
  },
  {
    slug: "islamic-mindfulness",
    label: "Islamic Mindfulness",
    group: "Personal Development & Spirituality",
    description: "Mindfulness and mental wellbeing through an Islamic lens.",
    icon: "🧘",
  },
  {
    slug: "islamic-psychology",
    label: "Islamic Psychology",
    group: "Personal Development & Spirituality",
    description: "Understanding the human soul and psyche in Islamic thought.",
    icon: "🧠",
  },

  // ── Daily Practice & Worship ──────────────────────────────────────────────
  {
    slug: "salah",
    label: "Salah (Prayer)",
    group: "Daily Practice & Worship",
    description: "The five daily prayers — method, focus, and inner dimensions.",
    icon: "🕋",
  },
  {
    slug: "fasting-sawm",
    label: "Fasting (Sawm)",
    group: "Daily Practice & Worship",
    description: "Ramadan, voluntary fasts, and the wisdom of fasting.",
    icon: "🌙",
  },
  {
    slug: "zakah-charity",
    label: "Zakah & Charity",
    group: "Daily Practice & Worship",
    description: "Obligatory almsgiving, sadaqah, and the ethics of giving.",
    icon: "💚",
  },
  {
    slug: "hajj-umrah",
    label: "Hajj & Umrah",
    group: "Daily Practice & Worship",
    description: "Pilgrimage rituals, preparation, and spiritual dimensions.",
    icon: "🕌",
  },
  {
    slug: "purification-taharah",
    label: "Purification (Taharah)",
    group: "Daily Practice & Worship",
    description: "Physical and ritual purification in Islamic practice.",
    icon: "💧",
  },

  // ── Lifestyle & Society ───────────────────────────────────────────────────
  {
    slug: "marriage-family",
    label: "Marriage & Family",
    group: "Lifestyle & Society",
    description: "Islamic guidance on marriage, spousal relations, and family.",
    icon: "💍",
  },
  {
    slug: "parenting",
    label: "Parenting",
    group: "Lifestyle & Society",
    description: "Raising children with Islamic values in the modern world.",
    icon: "👨‍👩‍👧",
  },
  {
    slug: "islamic-finance",
    label: "Business & Finance (Islamic)",
    group: "Lifestyle & Society",
    description: "Halal finance, Islamic economics, and ethical business.",
    icon: "💰",
  },
  {
    slug: "modesty-hijab",
    label: "Modesty & Hijab",
    group: "Lifestyle & Society",
    description: "The Islamic understanding and practice of modesty.",
    icon: "🧕",
  },
  {
    slug: "halal-haram",
    label: "Halal & Haram",
    group: "Lifestyle & Society",
    description: "Lawful and unlawful in food, transactions, and daily life.",
    icon: "✅",
  },

  // ── Ummah & Global Topics ─────────────────────────────────────────────────
  {
    slug: "islamic-history",
    label: "Islamic History",
    group: "Ummah & Global Topics",
    description: "The history of Islam — civilizations, scholars, and events.",
    icon: "🏛️",
  },
  {
    slug: "contemporary-issues",
    label: "Contemporary Issues",
    group: "Ummah & Global Topics",
    description: "Modern challenges and Islamic responses to today's world.",
    icon: "🌍",
  },
  {
    slug: "muslim-youth",
    label: "Muslim Youth",
    group: "Ummah & Global Topics",
    description: "Guidance and inspiration tailored for young Muslims.",
    icon: "🌱",
  },
  {
    slug: "dawah-outreach",
    label: "Dawah & Outreach",
    group: "Ummah & Global Topics",
    description: "Inviting others to Islam with wisdom and good character.",
    icon: "📣",
  },
  {
    slug: "islam-technology",
    label: "Islam & Technology",
    group: "Ummah & Global Topics",
    description: "Navigating the digital age through an Islamic framework.",
    icon: "💻",
  },

  // ── Audience-Based ────────────────────────────────────────────────────────
  {
    slug: "new-muslims",
    label: "For New Muslims",
    group: "Audience-Based",
    description: "Essential foundations for those who have recently embraced Islam.",
    icon: "🌟",
  },
  {
    slug: "for-youth",
    label: "For Youth",
    group: "Audience-Based",
    description: "Content designed specifically for Muslim youth.",
    icon: "🎒",
  },
  {
    slug: "for-sisters",
    label: "For Sisters",
    group: "Audience-Based",
    description: "Courses and guidance crafted for Muslim women.",
    icon: "🌸",
  },
  {
    slug: "for-brothers",
    label: "For Brothers",
    group: "Audience-Based",
    description: "Courses and guidance crafted for Muslim men.",
    icon: "💪",
  },
  {
    slug: "for-children",
    label: "For Children",
    group: "Audience-Based",
    description: "Age-appropriate Islamic education for children.",
    icon: "🧸",
  },
];

// ---------------------------------------------------------------------------
// 2. Groups (preserving original order)
// ---------------------------------------------------------------------------

export const CATEGORY_GROUPS = [
  "Core Islamic Sciences",
  "Personal Development & Spirituality",
  "Daily Practice & Worship",
  "Lifestyle & Society",
  "Ummah & Global Topics",
  "Audience-Based",
];

// ---------------------------------------------------------------------------
// 3. Lookup helpers
// ---------------------------------------------------------------------------

/** Slug → Category object */
const _bySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

/** Normalised label → slug (for mapping legacy free-text category values) */
const _labelToSlug = Object.fromEntries(
  CATEGORIES.map((c) => [c.label.toLowerCase().trim(), c.slug])
);

/**
 * Get a Category by its slug.
 * Returns `undefined` when not found — callers must handle this gracefully.
 * @param {string} slug
 * @returns {Category | undefined}
 */
export function getCategoryBySlug(slug) {
  return _bySlug[slug];
}

/**
 * Resolve a raw category string (as stored on a course document) to a known
 * slug.  Falls back to `null` when no match is found and logs a warning so
 * that legacy / mismatched data is visible during development.
 *
 * @param {string | undefined | null} raw – the value stored on the course
 * @returns {string | null} – a slug from CATEGORIES, or null
 */
export function resolveSlug(raw) {
  if (!raw) return null;
  const normalised = raw.toLowerCase().trim();
  // Exact slug match
  if (_bySlug[normalised]) return normalised;
  // Exact label match
  if (_labelToSlug[normalised]) return _labelToSlug[normalised];
  // Partial label match (handles e.g. "Fiqh (Islamic Jurisprudence)" stored as just "Fiqh")
  const partialMatch = CATEGORIES.find((c) =>
    c.label.toLowerCase().includes(normalised) ||
    normalised.includes(c.label.toLowerCase())
  );
  if (partialMatch) return partialMatch.slug;
  console.warn(
    `[categories] Unknown category value "${raw}" — falling back to "general" bucket.`
  );
  return null;
}

/**
 * Get categories grouped by their parent group, as an array of objects.
 * Useful for building grouped UIs (ComboBox, category hub grid).
 *
 * @returns {{ group: string, categories: Category[] }[]}
 */
export function getGroupedCategories() {
  return CATEGORY_GROUPS.map((group) => ({
    group,
    categories: CATEGORIES.filter((c) => c.group === group),
  }));
}

// ---------------------------------------------------------------------------
// 4. islamicCategories shim
//    Keeps lib/data.js consumers working without change while ComboBox and
//    new pages switch over to this module's richer shape.
// ---------------------------------------------------------------------------

/**
 * Drop-in replacement for the `islamicCategories` array from lib/data.js.
 * Shape: [{ main: string, subcategories: string[] }]
 */
export const islamicCategoriesCompat = CATEGORY_GROUPS.map((group) => ({
  main: group,
  subcategories: CATEGORIES.filter((c) => c.group === group).map(
    (c) => c.label
  ),
}));

// ---------------------------------------------------------------------------
// 5. Course-count derivation (client-side, backend-ready)
// ---------------------------------------------------------------------------

/**
 * Given a flat array of course objects (each with a `category` string field),
 * returns a map from slug → count.
 *
 * When the backend ships GET /api/courses/categories, replace this function
 * body with a fetch call — the return type stays identical so callers need
 * zero changes.
 *
 * @param {Array<{ category?: string }>} courses
 * @returns {Record<string, number>}
 */
export function getCategoryCounts(courses) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const course of courses) {
    const slug = resolveSlug(course.category);
    if (slug) {
      counts[slug] = (counts[slug] || 0) + 1;
    }
    // Courses with unknown categories are counted under the fallback UI only,
    // not attributed to any taxonomy slot.
  }
  return counts;
}
