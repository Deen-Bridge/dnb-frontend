import Image from "next/image";
import AuthNavButtons from "./AuthNavButtons";
import Link from "next/link";
const Header = () => {
  return (
    <nav className="px-4  overflow-x-hidden sticky top-0 z-10 bg-basic text-secondary">
      <div className="lg:flex hidden justify-between items-center flex-grow h-20">
        <Image
          src="/images/dnb-nobg.png"
          width={150}
          height={26}
          alt="Picture of the author"
          className="m-6"
        />


        <div className="flex items-center">
          <Link href="#" className="px-4">
            Service
          </Link>
          <Link href="#" className="px-4">
            FAQ
          </Link>
        </div>
        <div>
          <AuthNavButtons />
        </div>
      </div>

    </nav>
  );
};

export default Header;
