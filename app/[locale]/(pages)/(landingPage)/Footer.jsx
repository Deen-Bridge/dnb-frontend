import { FaTwitter, FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Link from "next/link";
import { useTranslations } from "next-intl";
export default function Footer() {
  const t = useTranslations("landing.footer");
  const links = [
    { name: t("courses"), href: "/dashboard/courses" },
    { name: t("library"), href: "/dashboard/library" },
    { name: t("spaces"), href: "/dashboard/spaces" },
    { name: t("sadaqah"), href: "/dashboard/sadaqah" },
    { name: t("blog"), href: "/blog" },
    { name: t("github"), href: "https://github.com/Deen-Bridge" },
  ];
  return (
    <footer id="contact" className="relative bg-basic text-white overflow-hidden ">
     
      {/* Glowing Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green-500 via-slate-800 to-green-500 opacity-30 blur-2xl z-0" />

      <div className="relative z-10 m-3 sm:m-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 gap-y-6 mb-12">
          {/* Company Info */}
          <div>
            <span
              className={cn(
                poppins_600,
                "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold  leading-snug bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text font-stretch-125%"
              )}
            >
              Deen Bridge
            </span>
            <p className="text-gray-200 text-sm leading-relaxed">      
                {t("description")}
            </p>
          </div>

          {/* Navigation Links */}
          <div className=" md:justify-self-center">
            <h3 className="text-3xl sm:text-4xl  font-semibold  mb-4 font-stretch-125%">
              {t("explore")}
            </h3>
            <ul className="space-y-4 text-sm">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-secondary transition duration-300 font-light"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Socials */}
          <div>
            <h3 className="text-3xl sm:text-4xl  font-semibold  mb-4 font-stretch-125%">
              {t("community")}
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed mb-6">
              {t("communityDescription")}
            </p>
            <div className="flex items-center gap-4 text-2xl">
              <Link
                href="https://github.com/Deen-Bridge"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Deen Bridge on GitHub"
                className="hover:text-secondary rounded-full p-2 transition"
              >
                <FaGithub />
              </Link>
              <Link
                href="https://x.com/deen_bridge"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Deen Bridge on X"
                className="hover:text-secondary rounded-full p-2 transition"
              >
                <FaTwitter />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-900 pt-6 flex items-center justify-center text-sm text-white font-stretch-125%">
          <p className="mt-4 text-center md:mt-0 md:text-start">
            © {new Date().getFullYear()} Deen Bridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
