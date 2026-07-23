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

  // Initial load & Geolocation auto-detection
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
      loadData(stored);
    } else if (typeof window !== "undefined" && navigator.geolocation) {
      // Try non-blocking geolocation
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "Current Location",
          };
          setLocation(geoLoc);
          setStoredLocation(geoLoc);
          loadData(geoLoc);
        },
        (_geoErr) => {
          // Fallback to profile country or default
          const fallbackLoc = user?.country ? { city: user.country } : null;
          loadData(fallbackLoc);
        },
        { timeout: 5000 }
      );
    } else {
      const fallbackLoc = user?.country ? { city: user.country } : null;
      loadData(fallbackLoc);
    }
  }, [user?.country, loadData]);

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
      <div className="bg-card text-card-foreground border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 w-full">
        {/* Top Header: Dates & Location */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-accent/10 text-accent font-semibold text-xs sm:text-sm px-3 py-1 rounded-full flex items-center gap-1.5 border border-accent/20">
              <Moon className="w-3.5 h-3.5 fill-accent" />
              {data?.hijriDate || "Hijri Date"}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {data?.gregorianDate}
            </span>
          </div>

          {/* Location Badge */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-3 py-1 rounded-full transition-all cursor-pointer border"
            title="Change location"
          >
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium truncate max-w-[180px]">
              {data?.locationName || "Location"}
            </span>
            <Search className="w-3 h-3 ml-1 opacity-60" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-16 bg-muted rounded-xl w-full" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={`skel-pr-${i}`} className="h-20 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-destructive font-medium">
              Unable to load prayer times.
            </p>
            <Button
              round
              outlined
              className="text-xs"
              onClick={() => loadData(location)}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Next Prayer Live Banner */}
            {nextPrayerInfo && (
              <div className="bg-gradient-to-r from-accent via-accent/90 to-highlight text-white rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 uppercase tracking-wider font-semibold">
                      {nextPrayerInfo.isTomorrow ? "Tomorrow's Next Prayer" : "Upcoming Prayer"}
                    </p>
                    <h4 className="text-base sm:text-lg font-bold">
                      {nextPrayerInfo.nextPrayerName} at {nextPrayerInfo.nextPrayerTimeFormatted}
                    </h4>
                  </div>
                </div>

                {/* Countdown Badge */}
                <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 self-end sm:self-center">
                  <span>In {countdownText}</span>
                </div>
              </div>
            )}

            {/* 5 Daily Prayer Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => {
                const IconComponent = PRAYER_ICONS[name] || Sun;
                const rawTime = data?.timings?.[name];
                const formattedTime = formatTime12h(rawTime);
                const isNext = nextPrayerInfo?.nextPrayerName === name;

                return (
                  <div
                    key={name}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                      isNext
                        ? "bg-accent/10 border-accent text-accent font-bold ring-2 ring-accent/30 shadow-sm"
                        : "bg-muted/30 border-border text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 mb-1 ${
                        isNext ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {name}
                    </span>
                    <span className="text-xs sm:text-sm font-medium mt-0.5">
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
            <label htmlFor="prayer-city" className="text-xs font-medium text-muted-foreground">City</label>
            <input
              id="prayer-city"
              type="text"
              placeholder="e.g. London, Dallas, Cairo"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prayer-country" className="text-xs font-medium text-muted-foreground">Country (Optional)</label>
            <input
              id="prayer-country"
              type="text"
              placeholder="e.g. UK, USA, Egypt"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
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
              <Navigation className="w-3.5 h-3.5 text-accent" /> Use Auto GPS
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
