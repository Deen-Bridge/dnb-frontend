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
import { AlignJustify } from 'lucide-react';
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";

const Navbar = () => {
  const t = useTranslations("landing.nav");
  const links = [
    { name: t("mission"), to: "/#mission" },
    { name: t("services"), to: "/#services" },
    { name: t("blog"), to: "/blog" },
    { name: t("github"), to: "https://github.com/Deen-Bridge" },
    { name: t("contact"), to: "/#contact" },
  ];
  return (
    <>
      {/* Desktop Nav */}
      <nav className="px-4 sticky top-0 z-10 bg-transparent text-secondary hidden lg:flex justify-between items-center h-20 font-stretch-125%">
        <Link href="/">
        <Image
          src="/images/dnb-nobg.png"
          width={150}
          height={26}
          alt={t("logo")}
          className="m-6"
        />
        </Link>
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="text-white hover:text-secondary transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <AuthNavButtons />
        <LocaleSwitcher className="text-white" />
      </nav>

      {/* Mobile Nav */}
      <nav className="lg:hidden flex items-center justify-between   sticky top-0 z-10 bg-transparent text-secondary">
        <Link href="/">
        <Image
          src="/images/dnb-nobg.png"
          width={80}
          height={26}
          alt="Logo"
        />
        </Link>
        <MobileNav links={links} />
      </nav>
    </>
  );
};

export default Navbar;

function MobileNav({ links }) {
  const t = useTranslations("landing.nav");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="focus:outline-none bg-transparent hover:bg-transparent">
          <AlignJustify size={24} className="text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-3/4 bg-muted">
        <SheetHeader className="mb-4 text-start text-xl font-semibold">
          {t("menu")}
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
          <LocaleSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
