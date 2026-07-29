import { books, spaces } from "@/lib/data";

export const fallbackCourses = [
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

export const fallbackUsers = [
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

export function getLocalSearchResults(term) {
  if (!term || !term.trim()) return [];
  const q = term.trim().toLowerCase();

  const matchedBooks = (books || [])
    .filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
    )
    .map((b) => ({ ...b, type: "book" }));

  const matchedSpaces = (spaces || [])
    .filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        (typeof s.host === "object" ? s.host?.name : s.host)?.toLowerCase().includes(q)
    )
    .map((s) => ({ ...s, type: "space" }));

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
