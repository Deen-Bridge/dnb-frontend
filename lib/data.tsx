import React from "react";
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

export type LucideIcon = React.ComponentType<any>; // TODO(types): Lucide icon component type

export interface NavMainItem {
  key: string;
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  badge?: string;
}

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

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
  ] as NavMainItem[],
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
  ] as NavSecondaryItem[],
};

export interface StepItem {
  id: number;
  icon: React.ReactNode;
  color: string;
}

export const studentSteps: StepItem[] = [
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

export const tutorSteps: StepItem[] = [
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
