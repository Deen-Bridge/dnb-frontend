import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaLongArrowAltRight,
} from "react-icons/fa";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="relative bg-basic text-white overflow-hidden ">
     
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
                Deen Bridge is your trusted platform for connecting learners and educators in a vibrant, supportive community. 
                Explore a wide range of courses, resources, and events designed to help you grow in knowledge and faith. 
                Join us on our mission to make quality Islamic education accessible to everyone, everywhere around the globe.
            </p>
          </div>

          {/* Navigation Links */}
          <div className=" md:justify-self-center">
            <h3 className="text-3xl sm:text-4xl  font-semibold  mb-4 font-stretch-125%">
              Explore
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                "Pricing Policy",
                "Payment and Refund Policy",
                "Scheduling Policy",
                "Cancellation and rescheduling policy",
                "Privacy Policy",
                "Terms of Service",
                "Cookies Policy",
              ].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase()}`}
                    className="hover:text-secondary transition duration-300 font-light"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Socials */}
          <div>
            <h3 className="text-3xl sm:text-4xl  font-semibold  mb-4 font-stretch-125%">
              Stay in the Loop
            </h3>
            <form className="flex items-center mb-4">
              <input
                type="email"
                placeholder="Input your email"
                className="px-4 py-2 w-full sm:w-auto flex-grow text-white rounded-full rounded-r-none focus:outline-none border border-accent placeholder-white"
              />
              <Button
                type="submit"
                round
                className="px-4 py-2  rounded-l-md transition border border-accent"
              >
                Subscribe
              </Button>
            </form>
            <div className="flex space-x-4 text-2xl  justify-start hover:text-green-600">
              <Link
                href="#"
                className="hover:bg-slate-200 rounded-full p-2 sm:p-6 "
              >
                <FaFacebookF className=" transition" />
              </Link>
              <Link
                href="#"
                className="hover:bg-slate-200 rounded-full p-2 sm:p-6"
              >
                <FaTwitter className=" transition" />
              </Link>
              <Link
                href="#"
                className="hover:bg-slate-200 rounded-full p-2 sm:p-6"
              >
                <FaLinkedinIn className=" transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-900 pt-6 flex items-center justify-center text-sm text-white font-stretch-125%">
          <p className="text-center md:text-left mt-4 md:mt-0">
            © 2025 Deen Bridge . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
