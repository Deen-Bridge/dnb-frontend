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

// Two tracks: learners on the left of HowItWorks, educators reversed below it.
export const studentSteps = [
  {
    id: 1,
    icon: <FaUserPlus className="text-ink-inverse w-5 h-5" />,
    title: "Create your account",
    desc: "Sign up free and tell us what you want to learn",
    color: "from-secondary to-highlight",
  },
  {
    id: 2,
    icon: <FaSearch className="text-ink-inverse w-5 h-5" />,
    title: "Explore the library",
    desc: "Browse courses and books curated by verified scholars",
    color: "from-highlight to-accent",
  },
  {
    id: 3,
    icon: <FaUsers className="text-ink-inverse w-5 h-5" />,
    title: "Join live spaces",
    desc: "Sit in on halaqahs, tafsir circles, and open Q&As",
    color: "from-secondary to-accent",
  },
  {
    id: 4,
    icon: <FaGraduationCap className="text-ink-inverse w-5 h-5" />,
    title: "Grow at your pace",
    desc: "Pick up where you left off, on any device",
    color: "from-accent to-basic",
  },
];

export const tutorSteps = [
  {
    id: 1,
    icon: <FaChalkboardTeacher className="text-ink-inverse w-5 h-5" />,
    title: "Apply to teach",
    desc: "Tell us your background and where your expertise lies",
    color: "from-secondary to-highlight",
  },
  {
    id: 2,
    icon: <FaCheckCircle className="text-ink-inverse w-5 h-5" />,
    title: "Get verified",
    desc: "Our team reviews your credentials and references",
    color: "from-highlight to-accent",
  },
  {
    id: 3,
    icon: <FaUpload className="text-ink-inverse w-5 h-5" />,
    title: "Publish your work",
    desc: "Upload courses and books, or schedule a live space",
    color: "from-secondary to-accent",
  },
  {
    id: 4,
    icon: <FaWallet className="text-ink-inverse w-5 h-5" />,
    title: "Get paid in USDC",
    desc: "Earnings settle to your Stellar wallet in seconds",
    color: "from-accent to-basic",
  },
];

