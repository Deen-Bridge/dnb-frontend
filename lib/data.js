import {
  Blocks,
  Calendar,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  FaUserPlus,
  FaSearch,
  FaUsers,
  FaGraduationCap,
} from "react-icons/fa";

export const data = {
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "/dashboard/ai",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      badge: "10",
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
};

export const islamicCategories = [
  {
    main: "Core Islamic Sciences",
    subcategories: [
      "Qur’an & Tafsir",
      "Hadith & Sunnah",
      "Fiqh (Islamic Jurisprudence)",
      "Aqeedah (Islamic Creed/Belief)",
      "Seerah (Life of the Prophet ﷺ)",
      "Usul al-Fiqh (Principles of Jurisprudence)",
    ],
  },
  {
    main: "Personal Development & Spirituality",
    subcategories: [
      "Tazkiyah (Self-Purification)",
      "Islamic Manners (Adab)",
      "Duas & Dhikr",
      "Islamic Mindfulness",
      "Islamic Psychology",
    ],
  },
  {
    main: "Daily Practice & Worship",
    subcategories: [
      "Salah (Prayer)",
      "Fasting (Sawm)",
      "Zakah & Charity",
      "Hajj & Umrah",
      "Purification (Taharah)",
    ],
  },
  {
    main: "Lifestyle & Society",
    subcategories: [
      "Marriage & Family",
      "Parenting",
      "Business & Finance (Islamic)",
      "Modesty & Hijab",
      "Halal & Haram",
    ],
  },
  {
    main: "Ummah & Global Topics",
    subcategories: [
      "Islamic History",
      "Contemporary Issues",
      "Muslim Youth",
      "Dawah & Outreach",
      "Islam & Technology",
    ],
  },
  {
    main: "Audience-Based",
    subcategories: [
      "For New Muslims",
      "For Youth",
      "For Sisters",
      "For Brothers",
      "For Children",
    ],
  },
];
export const steps = [
  {
    id: 1,
    icon: <FaUserPlus className="text-white w-6 h-6" />,
    title: "Join Community",
    desc: "Create your account and become part of our growing Ummah",
    position: "top-0 left-1/2 -translate-x-1/2 -translate-y-4",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    icon: <FaSearch className="text-white w-6 h-6" />,
    title: "Discover Resources",
    desc: "Explore curated courses, books, and learning materials",
    position: "top-1/4 right-4 translate-x-0",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 3,
    icon: <FaUsers className="text-white w-6 h-6" />,
    title: "Connect & Learn",
    desc: "Join live sessions and connect with fellow Muslims",
    position: "bottom-1/4 right-4 translate-x-0",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    icon: <FaGraduationCap className="text-white w-6 h-6" />,
    title: "Grow Together",
    desc: "Share knowledge and grow in your spiritual journey",
    position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-4",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    icon: <FaUsers className="text-white w-6 h-6" />,
    title: "Share Knowledge",
    desc: "Contribute your wisdom and inspire others in the community",
    position: "bottom-1/4 left-4 -translate-x-0",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    icon: <FaGraduationCap className="text-white w-6 h-6" />,
    title: "Achieve Excellence",
    desc: "Reach spiritual heights and become a beacon of knowledge",
    position: "top-1/4 left-4 -translate-x-0",
    color: "from-green-500 to-emerald-500",
  },
];
export const partners = [
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
