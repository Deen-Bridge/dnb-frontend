import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Book } from "lucide-react";

export const links = [
  {
    title: "Classes",
    url: "/dashboard/classes",
    icon: Book, // Icon for the link
    badge: "New", // Badge text
  },
  {
    title: "Assignments",
    url: "/dashboard/assignments",
    icon: Book,
    badge: "Due",
  },
  {
    title: "Exams",
    url: "/dashboard/exams",
    icon: Book,
    badge: "Upcoming",
  },
  {
    title: "Results",
    url: "/dashboard/results",
    icon: Book,
    badge: "Updated",
  },
];

export const data = {
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "/ai",
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
