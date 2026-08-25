"use client";
import { motion } from "framer-motion";

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  staggerParent: {
    hidden: {},
    visible: {},
  },
};

const childVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
};

export default function AnimatedSection({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.6,
  className = "",
  childVariant = "fadeUp",
  staggerDelay = 0.1,
}) {
  const v = variants[variant] || variants.fadeUp;
  const isStagger = variant === "staggerParent";

  if (isStagger) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        transition={{ staggerChildren: staggerDelay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        delay,
        duration,
        type: "spring",
        stiffness: 80,
        damping: 18,
      }}
      variants={v}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedChild({
  children,
  variant = "fadeUp",
  className = "",
}) {
  const v = childVariants[variant] || childVariants.fadeUp;

  return (
    <motion.div
      variants={v}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 16,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
