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
  FaChalkboardTeacher,
  FaCheckCircle,
  FaUpload,
  FaWallet,
} from "react-icons/fa";

export const data = {
  navMain: [
    {
      key: "search",
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      key: "askAi",
      title: "Ask AI",
      url: "/dashboard/ai",
      icon: Sparkles,
    },
    {
      key: "home",
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      key: "inbox",
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
// Two tracks: learners on the left of HowItWorks, educators reversed below it.
export const studentSteps = [
  {
    id: 1,
    icon: <FaUserPlus className="text-ink-inverse w-5 h-5" />,
    color: "from-secondary to-highlight",
  },
  {
    id: 2,
    icon: <FaSearch className="text-ink-inverse w-5 h-5" />,
    color: "from-highlight to-accent",
  },
  {
    id: 3,
    icon: <FaUsers className="text-ink-inverse w-5 h-5" />,
    color: "from-secondary to-accent",
  },
  {
    id: 4,
    icon: <FaGraduationCap className="text-ink-inverse w-5 h-5" />,
    color: "from-accent to-basic",
  },
];

export const tutorSteps = [
  {
    id: 1,
    icon: <FaChalkboardTeacher className="text-ink-inverse w-5 h-5" />,
    color: "from-secondary to-highlight",
  },
  {
    id: 2,
    icon: <FaCheckCircle className="text-ink-inverse w-5 h-5" />,
    color: "from-highlight to-accent",
  },
  {
    id: 3,
    icon: <FaUpload className="text-ink-inverse w-5 h-5" />,
    color: "from-secondary to-accent",
  },
  {
    id: 4,
    icon: <FaWallet className="text-ink-inverse w-5 h-5" />,
    color: "from-accent to-basic",
  },
];

