"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchPrayerTimes,
  getNextPrayerInfo,
  getStoredLocation,
  setStoredLocation,
  formatTime12h,
} from "@/lib/services/prayer-times";
import useAuth from "@/hooks/useAuth";
import {
  Moon,
  Sun,
  Sunset,
  Sunrise,
  CloudSun,
  MapPin,
  Clock,
  Search,
  RefreshCw,
  Navigation,
} from "lucide-react";
import Button from "@/components/atoms/form/Button";
import Modal from "@/components/molecules/Modal";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const PRAYER_ICONS = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
};

export default function PrayerTimesWidget() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState(() => getStoredLocation());
  const [nextPrayerInfo, setNextPrayerInfo] = useState(null);
  const [countdownText, setCountdownText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const timerRef = useRef(null);
  const loadDataRef = useRef(null);

  // Load Prayer Data
  const loadData = useCallback(async (locObj) => {
    setLoading(true);
    setError(false);
    try {
      const activeLocation = locObj || location || (user?.country ? { city: user.country } : null);
      const res = await fetchPrayerTimes(activeLocation);
      if (!res || (res.isFallback && !activeLocation)) {
        setError(true);
      } else {
        setData(res);
      }
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [location, user?.country]);

  // Keep ref current so the initial effect doesn't depend on loadData
  loadDataRef.current = loadData;

  // Initial load & Geolocation auto-detection
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
      loadDataRef.current(stored);
    } else if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "Current Location",
          };
          setLocation(geoLoc);
          setStoredLocation(geoLoc);
          loadDataRef.current(geoLoc);
        },
        (_geoErr) => {
          const fallbackLoc = user?.country ? { city: user.country } : null;
          loadDataRef.current(fallbackLoc);
        },
        { timeout: 5000 }
      );
    } else {
      const fallbackLoc = user?.country ? { city: user.country } : null;
      loadDataRef.current(fallbackLoc);
    }
  }, [user?.country]);

  // Live Timer Effect
  useEffect(() => {
    if (!data?.timings) return;

    const updateTimer = () => {
      const info = getNextPrayerInfo(data.timings, data.timezone);
      setNextPrayerInfo(info);

      const sec = info.remainingSeconds;
      const hours = Math.floor(sec / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;

      const pad = (num) => String(num).padStart(2, "0");
      setCountdownText(
        hours > 0
          ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
          : `${pad(minutes)}m ${pad(seconds)}s`
      );
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [data?.timings, data?.timezone]);

  // Manual Location Search Handler
  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    const newLoc = {
      city: cityInput.trim(),
      country: countryInput.trim(),
      name: countryInput.trim() ? `${cityInput.trim()}, ${countryInput.trim()}` : cityInput.trim(),
    };

    setLocation(newLoc);
    setStoredLocation(newLoc);
    setIsModalOpen(false);
    loadData(newLoc);
  };

  // Detect Current GPS Location Button Handler
  const handleAutoDetectGPS = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "Current Location",
          };
          setLocation(geoLoc);
          setStoredLocation(geoLoc);
          setIsModalOpen(false);
          loadData(geoLoc);
        },
        () => {
          alert("Geolocation access denied or unavailable.");
        }
      );
    }
  };

  return (
    <>
      <div className="w-full space-y-4 rounded-2xl border border-accent/10 bg-surface-raised p-4 text-ink shadow-sm sm:p-6">
        {/* Top Header: Dates & Location */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-accent/10 pb-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                poppins_600,
                "flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs text-accent sm:text-sm"
              )}
            >
              <Moon className="h-3.5 w-3.5 fill-accent" />
              {data?.hijriDate || "Hijri Date"}
            </span>
            <span className={cn(poppins_400, "text-xs text-ink-muted sm:text-sm")}>
              {data?.gregorianDate}
            </span>
          </div>

          {/* Location Badge */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              poppins_500,
              "flex cursor-pointer items-center gap-1.5 rounded-full border border-accent/15 bg-surface px-3 py-1 text-xs text-ink-muted transition-all hover:bg-accent/10 hover:text-ink sm:text-sm"
            )}
            title="Change location"
          >
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span className="max-w-[180px] truncate">
              {data?.locationName || "Location"}
            </span>
            <Search className="ml-1 h-3 w-3 opacity-60" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-16 w-full rounded-xl bg-accent/10" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={`skel-pr-${i}`} className="h-20 rounded-xl bg-accent/10" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="space-y-2 py-6 text-center">
            <p className={cn(poppins_500, "text-sm text-red-600")}>
              Unable to load prayer times.
            </p>
            <Button
              round
              outlined
              className="text-xs"
              onClick={() => loadData(location)}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Next Prayer Live Banner */}
            {nextPrayerInfo && (
              <div className="flex flex-col items-start justify-between gap-2 rounded-xl bg-gradient-to-r from-accent via-accent/90 to-highlight p-3.5 text-white shadow-sm sm:flex-row sm:items-center sm:p-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        poppins_600,
                        "text-xs uppercase tracking-wider text-white/80"
                      )}
                    >
                      {nextPrayerInfo.isTomorrow ? "Tomorrow's Next Prayer" : "Upcoming Prayer"}
                    </p>
                    <h4 className={cn(poppins_600, "text-base sm:text-lg")}>
                      {nextPrayerInfo.nextPrayerName} at {nextPrayerInfo.nextPrayerTimeFormatted}
                    </h4>
                  </div>
                </div>

                {/* Countdown Badge */}
                <div
                  className={cn(
                    poppins_600,
                    "flex items-center gap-1.5 self-end rounded-full bg-white/20 px-3.5 py-1.5 text-xs tracking-wide backdrop-blur-md sm:self-center sm:text-sm"
                  )}
                >
                  <span>In {countdownText}</span>
                </div>
              </div>
            )}

            {/* 5 Daily Prayer Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-3 md:grid-cols-5">
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => {
                const IconComponent = PRAYER_ICONS[name] || Sun;
                const rawTime = data?.timings?.[name];
                const formattedTime = formatTime12h(rawTime);
                const isNext = nextPrayerInfo?.nextPrayerName === name;

                return (
                  <div
                    key={name}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all",
                      isNext
                        ? "border-accent bg-accent/10 text-ink shadow-sm ring-2 ring-accent/30"
                        : "border-accent/10 bg-surface text-ink hover:bg-accent/5"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "mb-1 h-5 w-5",
                        isNext ? "text-accent" : "text-ink-muted"
                      )}
                    />
                    <span className={cn(poppins_600, "text-xs uppercase tracking-wider")}>
                      {name}
                    </span>
                    <span className={cn(poppins_500, "mt-0.5 text-xs sm:text-sm")}>
                      {formattedTime}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Manual Location Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Location for Prayer Times"
        className="max-w-sm w-full"
      >
        <form onSubmit={handleLocationSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="prayer-city" className={cn(poppins_500, "text-xs text-ink-muted")}>City</label>
            <input
              id="prayer-city"
              type="text"
              placeholder="e.g. London, Dallas, Cairo"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className={cn(
                poppins_400,
                "w-full rounded-lg border border-accent/15 bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              )}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prayer-country" className={cn(poppins_500, "text-xs text-ink-muted")}>Country (Optional)</label>
            <input
              id="prayer-country"
              type="text"
              placeholder="e.g. UK, USA, Egypt"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className={cn(
                poppins_400,
                "w-full rounded-lg border border-accent/15 bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              )}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" round className="w-full bg-accent text-white">
              Save Location
            </Button>
            <Button
              type="button"
              outlined
              round
              onClick={handleAutoDetectGPS}
              className="w-full flex items-center justify-center gap-1.5 text-xs"
            >
              <Navigation className="h-3.5 w-3.5 text-accent" /> Use Auto GPS
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
