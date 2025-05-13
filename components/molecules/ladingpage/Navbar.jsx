import Image from "next/image";
import AuthNavButtons from "./AuthNavButtons";
import Link from "next/link";

const links = [
  { name: "Service", to: "#services" },
  { name: "Contact", to: "#contact" },
  { name: "Blog", to: "/blog" },
  { name: "Mission", to: "#mission" }
]
const Header = () => {
  return (
    <>

    <nav className="px-4  overflow-x-hidden sticky top-0 z-10 bg-transparent text-secondary">
      <div className="lg:flex hidden justify-between items-center flex-grow h-20">
        <Image
          src="/images/dnb-nobg.png"
          width={150}
          height={26}
          alt="Picture of the author"
          className="m-6"
        />


        <div className="flex items-center">
          {links.map((link, key) => (
            <Link href={link.to} key={link.to} className="px-4 hover:text-white animate-in-out transition-all delay-200">
              {link.name}
            </Link>
          ))}
        </div>
        <div>
          <AuthNavButtons />
        </div>
      </div>

      </nav>
      <nav className="px-4  overflow-x-hidden sticky top-0 z-10 bg-transparent text-secondary">
        <div className="flex lg:hidden justify-between items-center flex-grow h-20">
          <Image
            src="/images/dnb-nobg.png"
            width={150}
            height={26}
            alt="Picture of the author"
            className="m-6"
          />


          <div className="flex items-center">
            {links.map((link, key) => (
              <Link href={link.to} key={link.to} className="px-4 hover:text-white animate-in-out transition-all delay-200">
                {link.name}
              </Link>
            ))}
          </div>
          <div>
            <AuthNavButtons />
          </div>
        </div>

      </nav>
    </>
  );
};

export default Header;
