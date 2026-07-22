/**
 * Real, attributable testimonials for the landing page.
 *
 * Maintainers: replace these placeholder entries with actual reviews from
 * verified learners who have given explicit consent for their words to be
 * published. Each entry should map to a real course on the platform.
 *
 * When the GET /api/reviews/featured endpoint is live, you can switch
 * Testimonials.jsx to fetch from there instead and delete this file.
 *
 * Fields
 * ──────
 * name        – Display name (first name + last initial is fine for privacy)
 * role        – Optional descriptor, e.g. "Student, Nigeria"
 * quote       – The learner's own words; keep under ~180 characters
 * courseTitle – Title of the course the review relates to
 * consent     – Must be true before an entry is published here
 */

const testimonials = [
  // ── Add real, consent-confirmed testimonials below ──
  //
  // Example shape (do not publish without consent: true):
  // {
  //   name: "Fatimah A.",
  //   role: "Student, UK",
  //   quote:
  //     "The Quran Tajweed course transformed how I recite. The instructor's patience is unmatched.",
  //   courseTitle: "Foundations of Tajweed",
  //   consent: true,
  // },
];

export default testimonials;
