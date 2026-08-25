/**
 * Isolated Prayer Times & Hijri Date Service
 * Handles location resolution, API fetching (Aladhan REST API), caching,
 * fallback calculations, Hijri date formatting, and next-prayer countdown calculations.
 */

const CACHE_KEY = "dnb_prayer_times_cache";
const LOCATION_STORAGE_KEY = "dnb_prayer_location";

/**
 * Format Hijri Date using Intl API as an offline-friendly fallback
 * @param {Date} date
 * @returns {string} e.g. "14 Safar 1446 AH"
 */
export function getFallbackHijriDate(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${formatter.format(date)} AH`;
  } catch (_e) {
    try {
      const fallbackFormatter = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `${fallbackFormatter.format(date)} AH`;
    } catch (_err) {
      return "1446 AH";
    }
  }
}

/**
 * Get stored location preference from localStorage
 * @returns {Object|null}
 */
export function getStoredLocation() {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(LOCATION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (_e) {
    return null;
  }
}

/**
 * Save location preference to localStorage
 * @param {Object} locationObj
 */
export function setStoredLocation(locationObj) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationObj));
  } catch (_e) {
    // Ignore storage errors
  }
}

/**
 * Convert 24-hour time ("14:30") to 12-hour formatted time ("2:30 PM")
 * @param {string} timeStr
 * @returns {string}
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const cleanTime = timeStr.split(" ")[0]; // Remove timezone offset if present
  const [hoursStr, minutesStr] = cleanTime.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || "00";
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Hour 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Fetch today's prayer times and Hijri date from Aladhan API with caching
 * @param {Object} location - { lat, lng, city, country, name }
 * @returns {Promise<Object>} - { timings, hijriDate, gregorianDate, locationName, timezone, isFallback }
 */
export async function fetchPrayerTimes(location) {
  const todayStr = new Date().toISOString().split("T")[0];
  const locationKey = location?.lat && location?.lng
    ? `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`
    : (location?.city || location?.name || "default");

  // Check cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.dateKey === todayStr && parsed.locationKey === locationKey && parsed.data) {
          return parsed.data;
        }
      }
    } catch (_e) {
      // Ignore cache read errors
    }
  }

  let apiUrl = "";
  let locationName = "Current Location";

  if (location?.lat && location?.lng) {
    const timestamp = Math.floor(Date.now() / 1000);
    apiUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${location.lat}&longitude=${location.lng}&method=2`;
    locationName = location.name || `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`;
  } else if (location?.city) {
    const country = location.country || "";
    apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(country)}&method=2`;
    locationName = location.country ? `${location.city}, ${location.country}` : location.city;
  } else {
    // Default fallback city (Mecca / Saudi Arabia)
    apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent("Mecca")}&country=${encodeURIComponent("Saudi Arabia")}&method=2`;
    locationName = "Mecca, Saudi Arabia";
  }

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Failed to fetch prayer times from API");
    const json = await res.json();
    const data = json.data;

    const rawTimings = data?.timings || {};
    const timings = {
      Fajr: rawTimings.Fajr || "05:00",
      Dhuhr: rawTimings.Dhuhr || "12:30",
      Asr: rawTimings.Asr || "15:45",
      Maghrib: rawTimings.Maghrib || "18:30",
      Isha: rawTimings.Isha || "20:00",
    };

    const hijriData = data?.date?.hijri;
    const hijriDate = hijriData
      ? `${hijriData.day} ${hijriData.month?.en} ${hijriData.year} AH`
      : getFallbackHijriDate();

    const gregorianDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timezone = data?.meta?.timezone || null;

    const result = {
      timings,
      hijriDate,
      gregorianDate,
      locationName,
      timezone,
      isFallback: false,
    };

    // Save to cache
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            dateKey: todayStr,
            locationKey,
            data: result,
          })
        );
      } catch (_e) {
        // Ignore cache write errors
      }
    }

    return result;
  } catch (error) {
    console.warn("PrayerTimes API fallback used:", error);
    // Offline / fallback response
    const fallbackTimings = {
      Fajr: "05:15",
      Dhuhr: "12:30",
      Asr: "15:45",
      Maghrib: "18:25",
      Isha: "19:50",
    };
    return {
      timings: fallbackTimings,
      hijriDate: getFallbackHijriDate(),
      gregorianDate: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      locationName: locationName || "Local Time",
      timezone: null,
      isFallback: true,
    };
  }
}

/**
 * Calculate the next upcoming prayer and remaining seconds
 * @param {Object} timings - { Fajr, Dhuhr, Asr, Maghrib, Isha }
 * @param {string|null} [timezone=null] - Target location IANA timezone (e.g. "Europe/London")
 * @returns {Object} - { nextPrayerName, nextPrayerTimeFormatted, remainingSeconds, isTomorrow }
 */
export function getNextPrayerInfo(timings, timezone = null) {
  if (!timings) return { nextPrayerName: "Fajr", remainingSeconds: 0, isTomorrow: false };

  let nowInTz = new Date();
  if (timezone) {
    try {
      const tzStr = new Date().toLocaleString("en-US", { timeZone: timezone });
      nowInTz = new Date(tzStr);
    } catch (_e) {
      nowInTz = new Date();
    }
  }

  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (const name of prayerNames) {
    const timeStr = timings[name];
    if (!timeStr) continue;
    const cleanTime = timeStr.split(" ")[0];
    const [h, m] = cleanTime.split(":").map((v) => parseInt(v, 10));

    const prayerDate = new Date(nowInTz);
    prayerDate.setHours(h, m, 0, 0);

    if (prayerDate > nowInTz) {
      const remainingSeconds = Math.max(0, Math.floor((prayerDate.getTime() - nowInTz.getTime()) / 1000));
      return {
        nextPrayerName: name,
        nextPrayerTimeFormatted: formatTime12h(timeStr),
        remainingSeconds,
        isTomorrow: false,
      };
    }
  }

  // If all prayers passed today, next is tomorrow's Fajr
  const fajrStr = timings.Fajr || "05:00";
  const cleanFajr = fajrStr.split(" ")[0];
  const [fh, fm] = cleanFajr.split(":").map((v) => parseInt(v, 10));

  const tomorrowFajr = new Date(nowInTz);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  tomorrowFajr.setHours(fh, fm, 0, 0);

  const remainingSeconds = Math.max(0, Math.floor((tomorrowFajr.getTime() - nowInTz.getTime()) / 1000));

  return {
    nextPrayerName: "Fajr",
    nextPrayerTimeFormatted: formatTime12h(fajrStr),
    remainingSeconds,
    isTomorrow: true,
  };
}
