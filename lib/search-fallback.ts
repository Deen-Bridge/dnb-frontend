export interface FallbackCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  type: "course";
}

export interface FallbackUser {
  id: string;
  name: string;
  role: string;
  bio: string;
  type: "user";
}

export interface FallbackBook {
  id: string;
  title: string;
  author: string;
  category: string;
  type?: "book";
}

export interface FallbackSpace {
  id: string;
  title: string;
  description: string;
  category: string;
  host: { name?: string } | string;
  type?: "space";
}

export const fallbackCourses: FallbackCourse[] = [
  {
    id: "course-101",
    title: "Fiqh of Purification & Salah",
    description: "Comprehensive practical course on ritual purity, ablution, and prayer jurisprudence.",
    category: "Fiqh",
    price: 0,
    type: "course",
  },
  {
    id: "course-102",
    title: "Aqeedah Essentials & Tawheed",
    description: "Foundational principles of Islamic creed, faith, and monotheism.",
    category: "Aqidah",
    price: 15,
    type: "course",
  },
  {
    id: "course-103",
    title: "Hadith Sciences & Sahih Selections",
    description: "Introduction to hadith methodology and study of core Hadith collections.",
    category: "Hadith",
    price: 10,
    type: "course",
  },
  {
    id: "course-104",
    title: "Seerah: Life of Prophet Muhammad ﷺ",
    description: "In-depth historical and spiritual study of the life of the Prophet.",
    category: "Seerah",
    price: 0,
    type: "course",
  },
];

export const fallbackUsers: FallbackUser[] = [
  {
    id: "user-101",
    name: "Ustadh Ali Mukhtar",
    role: "Educator",
    bio: "Senior Islamic Scholar & Lecturer in Fiqh",
    type: "user",
  },
  {
    id: "user-102",
    name: "Ustadh Maryam Usman",
    role: "Educator",
    bio: "Qur'an & Tafsir Specialist",
    type: "user",
  },
  {
    id: "user-103",
    name: "Dr. Bilal Philips",
    role: "Educator",
    bio: "Author and Founder of International Open University",
    type: "user",
  },
  {
    id: "user-104",
    name: "Ustadh Ahmad Bello",
    role: "Educator",
    bio: "Hadith & Islamic History Instructor",
    type: "user",
  },
];

const fallbackBooks: FallbackBook[] = [
  {
    id: "book-101",
    title: "The Noble Qur'an: English Translation",
    author: "Dr. Muhammad Muhsin Khan",
    category: "Qur'an & Tafsir",
  },
  {
    id: "book-102",
    title: "Riyad us-Saliheen",
    author: "Imam Nawawi",
    category: "Hadith & Sunnah",
  },
  {
    id: "book-103",
    title: "Fortress of the Muslim",
    author: "Sa'id bin Ali bin Wahf Al-Qahtani",
    category: "Duas & Dhikr",
  },
  {
    id: "book-104",
    title: "The Sealed Nectar",
    author: "Saifur Rahman Al-Mubarakpuri",
    category: "Seerah",
  },
];

const fallbackSpaces: FallbackSpace[] = [
  {
    id: "space-101",
    title: "Qur'an Study Circle",
    description: "Weekly group study and reflection on selected Qur'anic verses.",
    category: "Qur'an & Tafsir",
    host: { name: "Ustadh Ali Mukhtar" },
  },
  {
    id: "space-102",
    title: "Fiqh Q&A Session",
    description: "Open floor for questions on Islamic jurisprudence.",
    category: "Fiqh (Islamic Jurisprudence)",
    host: { name: "Ustadh Ahmad Bello" },
  },
  {
    id: "space-103",
    title: "Sisters' Halaqa",
    description: "Weekly gathering for sisters to learn and connect.",
    category: "For Sisters",
    host: { name: "Ustadh Maryam Usman" },
  },
  {
    id: "space-104",
    title: "Hadith Memorization Group",
    description: "Structured program to memorize and understand authentic Hadith.",
    category: "Hadith & Sunnah",
    host: { name: "Dr. Bilal Philips" },
  },
];

export function getLocalSearchResults(term?: string): any[] { // TODO(types): Mixed search entity results array
  if (!term || !term.trim()) return [];
  const q = term.trim().toLowerCase();

  const matchedBooks = (fallbackBooks || [])
    .filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
    )
    .map((b) => ({ ...b, type: "book" as const }));

  const matchedSpaces = (fallbackSpaces || [])
    .filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        (typeof s.host === "object" ? s.host?.name : s.host)?.toLowerCase().includes(q)
    )
    .map((s) => ({ ...s, type: "space" as const }));

  const matchedCourses = fallbackCourses.filter(
    (c) =>
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
  );

  const matchedUsers = fallbackUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
  );

  return [...matchedCourses, ...matchedBooks, ...matchedUsers, ...matchedSpaces];
}
