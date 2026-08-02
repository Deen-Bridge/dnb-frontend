"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AuthNavButtons from "./AuthNavButtons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";

// Anchors match the section ids actually rendered on the landing page.
const links = [
  { name: "Explore", to: "/#explore" },
  { name: "How It Works", to: "/#how-it-works" },
  { name: "AI", to: "/ai" },
  { name: "Stellar", to: "/stellar" },
  { name: "FAQ", to: "/#faq" },
  { name: "Blog", to: "/blog" },
  { name: "Contact", to: "/contact" },
];

/**
 * Fixed, not sticky: the bar used to live inside Hero's `overflow-hidden`
 * h-screen main, which both disables `position: sticky` and ends the sticky
 * container after one viewport — so it vanished on scroll.
 *
 * `solid` forces the background on for pages that open on a light section,
 * where the white links would otherwise be invisible at scroll-top.
 */
const Navbar = ({ solid = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filled = solid || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        filled
          ? "border-b border-secondary/20 bg-basic/90 shadow-lg backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      {/* Desktop Nav */}
      <nav className="mx-auto hidden h-20 max-w-7xl items-center justify-between px-6 font-stretch-125% lg:flex">
        <Link href="/" aria-label="Deen Bridge home">
          <Image
            src="/images/dnb-nobg.png"
            width={150}
            height={26}
            alt="Deen Bridge"
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="text-ink-inverse transition-colors duration-200 hover:text-secondary"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <AuthNavButtons />
      </nav>

      {/* Mobile Nav */}
      <nav className="flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href="/" aria-label="Deen Bridge home">
          <Image
            src="/images/dnb-nobg.png"
            width={80}
            height={26}
            alt="Deen Bridge"
            className="h-9 w-auto"
          />
        </Link>
        <MobileNav />
      </nav>
    </header>
  );
};

export default Navbar;

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label="Open menu"
          className="focus:outline-none bg-transparent hover:bg-transparent"
        >
          <AlignJustify size={24} className="text-ink-inverse" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-3/4 bg-muted">
        <SheetHeader className="mb-4 text-left text-xl font-semibold">
          Menu
        </SheetHeader>
        <nav className="flex flex-col space-y-4 px-4 font-stretch-125%">
          {links.map((link) => (
            <SheetClose asChild key={link.to}>
              <Link
                href={link.to}
                className="text-md font-stretch-90% font-light hover:font-medium hover:text-primary transition-all"
              >
                {link.name}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-6 px-4 text-sm">
          <AuthNavButtons />
        </div>
      </SheetContent>
    </Sheet>
  );
}
