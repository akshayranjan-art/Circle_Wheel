import {
  Atom,
  BarChart3,
  Bell,
  Bookmark,
  Boxes,
  Camera,
  Compass,
  Cpu,
  Globe2,
  Heart,
  Home,
  Image,
  MessageCircle,
  Music,
  PlusCircle,
  Radar,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type OrbitItem = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
};

/** Up to 20 slots can orbit the core at once. */
export const ORBIT_ITEMS: OrbitItem[] = [
  { id: "home", to: "/", label: "Home", icon: Home },
  { id: "explore", to: "/explore", label: "Explore", icon: Compass },
  { id: "create", to: "/create", label: "Create", icon: PlusCircle },
  { id: "messages", to: "/messages", label: "Messages", icon: MessageCircle },
  { id: "stats", to: "/stats", label: "Stats", icon: BarChart3 },
  { id: "settings", to: "/settings", label: "Settings", icon: Settings },
  { id: "search", to: "/explore", label: "Search", icon: Search },
  { id: "boost", to: "/create", label: "Boost", icon: Zap },
  { id: "launch", to: "/create", label: "Launch", icon: Rocket },
  { id: "radar", to: "/stats", label: "Radar", icon: Radar },
  { id: "core", to: "/stats", label: "Core", icon: Cpu },
  { id: "atoms", to: "/explore", label: "Atoms", icon: Atom },
  { id: "shield", to: "/settings", label: "Shield", icon: Shield },
  { id: "alerts", to: "/messages", label: "Alerts", icon: Bell },
  { id: "crew", to: "/messages", label: "Crew", icon: Users },
  { id: "saved", to: "/explore", label: "Saved", icon: Bookmark },
  { id: "media", to: "/create", label: "Media", icon: Image },
  { id: "capture", to: "/create", label: "Capture", icon: Camera },
  { id: "sound", to: "/explore", label: "Sound", icon: Music },
  { id: "world", to: "/", label: "World", icon: Globe2 },
];

export const EXTRA_ICONS = { Sparkles, Star, Heart, Boxes };
