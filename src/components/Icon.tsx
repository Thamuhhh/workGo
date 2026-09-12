import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Clock,
  Construction,
  FileText,
  Home,
  Inbox,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  Mic,
  Navigation,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  User,
  Users,
  Utensils,
  Wallet,
  XCircle,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  checkmark: Check,
  'ticket-outline': Ticket,
  'business-outline': Building2,
  search: Search,
  'search-outline': Search,
  'chevron-back': ChevronLeft,
  'chevron-down': ChevronDown,
  'close-circle': XCircle,
  'time-outline': Clock,
  'grid-outline': LayoutGrid,
  'construct-outline': Construction,
  'file-tray-outline': Inbox,
  star: Star,
  'person-outline': User,
  'alert-circle-outline': AlertCircle,
  'checkmark-circle': CheckCircle2,
  'location-outline': MapPin,
  'call-outline': Phone,
  'calendar-outline': Calendar,
  'navigate-outline': Navigation,
  'people-outline': Users,
  'bulb-outline': Lightbulb,
  'document-text-outline': FileText,
  'document-text': FileText,
  home: Home,
  'home-outline': Home,
  chatbubble: MessageCircle,
  'chatbubble-outline': MessageCircle,
  restaurant: Utensils,
  'restaurant-outline': Utensils,
  car: Car,
  'car-outline': Car,
  briefcase: Briefcase,
  'briefcase-outline': Briefcase,
  megaphone: Megaphone,
  'megaphone-outline': Megaphone,
  sparkles: Sparkles,
  'sparkles-outline': Sparkles,
  'paper-plane-outline': Send,
  'shield-checkmark': ShieldCheck,
  'wallet-outline': Wallet,
  mic: Mic,
  'mic-outline': Mic,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size = 22, color = '#000000', style }) => {
  const LucideIcon = ICON_MAP[name] ?? ICON_MAP['briefcase-outline'];
  return <LucideIcon size={size} color={color} strokeWidth={2} style={style} />;
};

export default Icon;