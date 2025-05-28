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
const links = [
  { name: "Service", to: "#services" },
  { name: "Contact", to: "#contact" },
  { name: "Blog", to: "/blog" },
  { name: "Mission", to: "#mission" },
];

const Header = () => {
  return (
    <>
      {/* Desktop Nav */}
      <nav className="px-4 sticky top-0 z-10 bg-transparent text-secondary hidden lg:flex justify-between items-center h-20">
        <Image
          src="/images/dnb-nobg.png"
          width={150}
          height={26}
          alt="Logo"
          className="m-6"
        />
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="hover:text-white transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <AuthNavButtons />
      </nav>

      {/* Mobile Nav */}
      <nav className="lg:hidden flex items-center justify-between   sticky top-0 z-10 bg-transparent text-secondary">
        <Image
          src="/images/dnb-nobg.png"
          width={80}
          height={26}
          alt="Logo"
        />
        <MobileNav />
      </nav>
    </>
  );
};

export default Header;

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="focus:outline-none bg-transparent hover:bg-transparent">
          <AlignJustify size={80} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-3/4 bg-muted">
        <SheetHeader className="mb-4 text-left text-xl font-semibold">
          Menu
        </SheetHeader>
        <nav className="flex flex-col space-y-4 px-4 ">
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
