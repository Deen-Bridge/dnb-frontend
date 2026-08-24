"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import createGlobe from "cobe";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Globe, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import AnimatedSection from "@/components/molecules/ladingpage/AnimatedSection";
import IslamicPattern, { ArabesqueDivider } from "@/components/molecules/ladingpage/IslamicPattern";

// Muslim-majority countries and major cities with Muslim communities
const markers = [
  // Middle East
  { location: [21.3891, 39.8579], size: 0.08, id: "makkah" },       // Makkah
  { location: [24.4672, 39.6112], size: 0.05, id: "medina" },       // Medina
  { location: [25.2048, 55.2708], size: 0.04, id: "dubai" },        // Dubai/UAE
  { location: [31.9497, 35.9329], size: 0.04, id: "amman" },        // Jordan
  { location: [31.7683, 35.2137], size: 0.04, id: "jerusalem" },    // Jerusalem
  { location: [33.3152, 44.3661], size: 0.04, id: "baghdad" },      // Iraq
  { location: [35.6892, 51.3890], size: 0.05, id: "tehran" },       // Iran
  { location: [36.2021, 37.1343], size: 0.04, id: "aleppo" },       // Syria
  // North Africa
  { location: [30.0444, 31.2357], size: 0.05, id: "cairo" },        // Egypt
  { location: [33.9716, -6.8498], size: 0.04, id: "rabat" },        // Morocco
  { location: [36.7538, 3.0588], size: 0.04, id: "algiers" },       // Algeria
  { location: [36.8065, 10.1815], size: 0.04, id: "tunis" },        // Tunisia
  { location: [32.8872, 13.1913], size: 0.04, id: "tripoli" },      // Libya
  // Sub-Saharan Africa
  { location: [6.5244, 3.3792], size: 0.05, id: "lagos" },          // Nigeria
  { location: [14.6928, -17.4467], size: 0.04, id: "dakar" },       // Senegal
  { location: [12.6392, -8.0029], size: 0.04, id: "bamako" },       // Mali
  { location: [9.0579, 7.4951], size: 0.04, id: "abuja" },          // Nigeria (Abuja)
  // South Asia
  { location: [33.6844, 73.0479], size: 0.06, id: "islamabad" },    // Pakistan
  { location: [23.8103, 90.4125], size: 0.05, id: "dhaka" },        // Bangladesh
  { location: [28.6139, 77.2090], size: 0.04, id: "delhi" },        // India
  // Southeast Asia
  { location: [-6.2088, 106.8456], size: 0.06, id: "jakarta" },     // Indonesia
  { location: [3.139, 101.6869], size: 0.05, id: "kualalumpur" },   // Malaysia
  // Central Asia
  { location: [41.2995, 69.2401], size: 0.04, id: "tashkent" },     // Uzbekistan
  { location: [43.2228, 76.8512], size: 0.04, id: "almaty" },       // Kazakhstan
  // Europe
  { location: [41.0082, 28.9784], size: 0.05, id: "istanbul" },     // Turkey
  { location: [43.8563, 18.4131], size: 0.03, id: "sarajevo" },     // Bosnia
  // Americas
  { location: [40.7128, -74.006], size: 0.03, id: "newyork" },      // New York
  { location: [29.7604, -95.3698], size: 0.03, id: "houston" },     // Houston
];

// Arcs connecting Makkah to major cities (Hajj/pilgrimage theme)
const arcs = [
  { from: [21.3891, 39.8579], to: [30.0444, 31.2357] },    // Makkah → Cairo
  { from: [21.3891, 39.8579], to: [33.6844, 73.0479] },    // Makkah → Islamabad
  { from: [21.3891, 39.8579], to: [-6.2088, 106.8456] },   // Makkah → Jakarta
  { from: [21.3891, 39.8579], to: [36.7538, 10.1815] },    // Makkah → Tunis
  { from: [21.3891, 39.8579], to: [41.0082, 28.9784] },    // Makkah → Istanbul
  { from: [21.3891, 39.8579], to: [6.5244, 3.3792] },      // Makkah → Lagos
  { from: [21.3891, 39.8579], to: [3.139, 101.6869] },     // Makkah → KL
  { from: [21.3891, 39.8579], to: [25.2048, 55.2708] },    // Makkah → Dubai
  { from: [21.3891, 39.8579], to: [35.6892, 51.3890] },    // Makkah → Tehran
  { from: [21.3891, 39.8579], to: [23.8103, 90.4125] },    // Makkah → Dhaka
  { from: [21.3891, 39.8579], to: [14.6928, -17.4467] },   // Makkah → Dakar
  { from: [21.3891, 39.8579], to: [40.7128, -74.006] },    // Makkah → New York
];

const stats = [
  { value: "57+", id: "countries" },
  { value: "1.8B+", id: "muslims" },
  { value: "24/7", id: "access" },
];

function GlobeCanvas() {
  const canvasRef = useRef(null);
  const phiRef = useRef(0);

  useEffect(() => {
    let destroyed = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.15,
      dark: 1,
      diffuse: 1.4,
      scale: 1.1,
      mapSamples: 20000,
      mapBrightness: 5,
      baseColor: [0.05, 0.15, 0.02],
      markerColor: [0, 0.51, 0],
      glowColor: [0, 0.3, 0],
      markers,
      arcs: arcs.map((a) => ({ ...a, color: [0, 0.4, 0] })),
      arcColor: [0, 0.35, 0],
      arcWidth: 0.4,
      arcHeight: 0.3,
      markerElevation: 0.02,
      onRender: (state) => {
        if (destroyed) return;
        state.phi = phiRef.current;
        phiRef.current += 0.003;
      },
    });

    return () => {
      destroyed = true;
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", maxWidth: 600, maxHeight: 600 }}
      className="cursor-grab active:cursor-grabbing"
    />
  );
}

export default function GlobalReach() {
  const t = useTranslations("landing.globalReach");
  const features = t.raw("features");

  return (
    <section className="relative py-20 px-4 sm:px-6 bg-basic overflow-hidden">
      <IslamicPattern opacity={0.04} color="#009900" />

      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <AnimatedSection variant="fadeUp">
          <div className="text-center mb-12">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-300 backdrop-blur-sm">
              <Globe className="w-4 h-4" />
              {t("badge")}
            </span>
            <h2
              className={cn(
                poppins_600,
                "text-4xl sm:text-5xl lg:text-7xl font-bold mt-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text"
              )}
            >
              {t("headingLine1")}
              <br />
              {t("headingLine2")}
            </h2>
            <p className="text-lg sm:text-xl text-green-200/80 max-w-2xl mx-auto mt-6">
              {t("subtitle")}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Globe */}
          <AnimatedSection variant="scaleUp" delay={0.2}>
            <div className="relative flex justify-center">
              <div className="w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] lg:w-[550px] lg:h-[550px]">
                <GlobeCanvas />
              </div>
              {/* Glow behind globe */}
              <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
            </div>
          </AnimatedSection>

          {/* Content */}
          <div className="space-y-8">
            <AnimatedSection variant="slideRight" delay={0.3}>
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 100 }}
                      className="text-center p-4 rounded-2xl bg-white/5 border border-green-500/10 backdrop-blur-sm"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-green-400">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-green-300/70 mt-1">
                        {t(`stats.${stat.id}`)}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p className="text-green-200/70 leading-relaxed">
                  {t("description")}
                </p>

                {/* Feature highlights */}
                <div className="space-y-3">
                  {features.map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <MapPin className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                      <span className="text-sm text-green-200/80">{text}</span>
                    </motion.div>
                  ))}
                </div>

                <Button
                  wide
                  round
                  to="/signup"
                  className="text-white px-10 py-3 text-lg font-semibold animate-glow-pulse transition-all duration-300 hover:scale-105"
                >
                  {t("cta")}
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      <ArabesqueDivider className="mt-16" color="#009900" />
    </section>
  );
}
