"use client";

import Image from "next/image";

const partners = [
  {
    name: "Islamic Relief",
    logo: "https://logo.clearbit.com/islamic-relief.org",
  },
  { name: "Muslim Aid", logo: "https://logo.clearbit.com/muslimaid.org" },
  {
    name: "Islamic Society of North America",
    logo: "https://logo.clearbit.com/isna.net",
  },
  {
    name: "Council on American-Islamic Relations",
    logo: "https://logo.clearbit.com/cair.com",
  },
  {
    name: "Islamic Foundation",
    logo: "https://logo.clearbit.com/islamicfoundation.org",
  },
  { name: "Muslim World League", logo: "https://logo.clearbit.com/themwl.org" },
  {
    name: "Islamic Development Bank",
    logo: "https://logo.clearbit.com/isdb.org",
  },
  {
    name: "Organization of Islamic Cooperation",
    logo: "https://logo.clearbit.com/oic-oci.org",
  },
  {
    name: "Islamic Chamber of Commerce",
    logo: "https://logo.clearbit.com/iccwbo.org",
  },
  {
    name: "International Islamic University",
    logo: "https://logo.clearbit.com/iiu.edu.pk",
  },
  {
    name: "Al-Azhar University",
    logo: "https://logo.clearbit.com/azhar.edu.eg",
  },
  {
    name: "King Fahd Islamic Center",
    logo: "https://logo.clearbit.com/kfipc.org",
  },
  {
    name: "Islamic Cultural Center",
    logo: "https://logo.clearbit.com/iccuk.org",
  },
  {
    name: "Muslim Association of Britain",
    logo: "https://logo.clearbit.com/mabonline.net",
  },
  {
    name: "Islamic Society of Britain",
    logo: "https://logo.clearbit.com/isb.org.uk",
  },
  {
    name: "Muslim Council of Britain",
    logo: "https://logo.clearbit.com/mcb.org.uk",
  },
  {
    name: "Islamic Foundation of Toronto",
    logo: "https://logo.clearbit.com/islamicfoundation.ca",
  },
  {
    name: "Islamic Society of Greater Houston",
    logo: "https://logo.clearbit.com/isgh.org",
  },
  {
    name: "Islamic Center of Southern California",
    logo: "https://logo.clearbit.com/icocmasjid.org",
  },
  {
    name: "Islamic Center of America",
    logo: "https://logo.clearbit.com/icofa.com",
  },
];

export default function Partners() {
  return (
    <section className="w-full py-16 px-4 sm:px-8 bg-white dark:bg-basic text-basic dark:text-white flex flex-col items-center overflow-hidden">
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-center">
        Our Partners
      </h2>
      <p className="text-lg mb-8 text-center max-w-2xl">
        We're proud to collaborate with Islamic organizations and communities
        that share our vision for growth and learning.
      </p>

      <div className="w-full max-w-6xl">
        <div className="flex animate-scroll">
          {/* First set of logos */}
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.target.src = "/images/dnb.png"; // Fallback image
                }}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {partners.map((partner) => (
            <div
              key={`${partner.name}-duplicate`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.target.src = "/images/dnb.png"; // Fallback image
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
