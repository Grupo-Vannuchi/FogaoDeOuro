import {
  Palette,
  Camera,
  Megaphone,
  TrendingUp,
  Target,
  Sparkles,
  FileSearchIcon,
  Cpu,
  Share2,
  Bot,
  Globe,
  Workflow,
  Printer,
  Video,
  Info,
  BookOpen,
  FileText,
  Newspaper,
  ShieldCheck,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Instagram } from "@/components/ui/brand-icons";

/**
 * Maps the icon names stored on `Service.icon` to lucide components. Add new
 * entries here when introducing services with new icons; unknown names fall
 * back to a neutral sparkle.
 */
const icons: Record<string, LucideIcon> = {
  Instagram,
  Palette,
  Camera,
  Megaphone,
  TrendingUp,
  Target,
  FileSearchIcon,
  Cpu,
  Share2,
  Bot,
  Globe,
  Workflow,
  Printer,
  Video,
  Info,
  BookOpen,
  FileText,
  Newspaper,
  ShieldCheck,
  Building2,
};

/** The icon names available to `Service.icon`, for admin pickers and validation. */
export const iconNames = Object.keys(icons);

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Component = icons[name] ?? Sparkles;
  return <Component className={className} aria-hidden />;
}
