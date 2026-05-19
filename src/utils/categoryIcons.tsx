import type { ReactNode } from 'react';
import {
  Sparkles,
  Coffee,
  LayoutGrid,
  Shirt,
  Gift,
  Heart,
  Image,
  Palette,
  Baby,
  PartyPopper,
  GraduationCap,
  Trophy,
  BriefcaseBusiness,
  Home,
  Frame,
  CupSoda,
  Utensils,
  Flower,
  Star,
  Crown,
  CakeSlice,
  BookOpen,
  BadgeCheck,
} from 'lucide-react';

export const CATEGORY_ICON_OPTIONS = [
  { name: 'Sparkles', label: 'Brilho', icon: Sparkles },
  { name: 'Coffee', label: 'Canecas', icon: Coffee },
  { name: 'CupSoda', label: 'Copos', icon: CupSoda },
  { name: 'LayoutGrid', label: 'Azulejos', icon: LayoutGrid },
  { name: 'Frame', label: 'Quadros', icon: Frame },
  { name: 'Image', label: 'Fotos', icon: Image },
  { name: 'Shirt', label: 'Textil', icon: Shirt },
  { name: 'Gift', label: 'Presentes', icon: Gift },
  { name: 'Heart', label: 'Afeto', icon: Heart },
  { name: 'PartyPopper', label: 'Festas', icon: PartyPopper },
  { name: 'CakeSlice', label: 'Aniversario', icon: CakeSlice },
  { name: 'Baby', label: 'Infantil', icon: Baby },
  { name: 'GraduationCap', label: 'Formatura', icon: GraduationCap },
  { name: 'Trophy', label: 'Premios', icon: Trophy },
  { name: 'BriefcaseBusiness', label: 'Corporativo', icon: BriefcaseBusiness },
  { name: 'Home', label: 'Decoracao', icon: Home },
  { name: 'Utensils', label: 'Cozinha', icon: Utensils },
  { name: 'Flower', label: 'Flores', icon: Flower },
  { name: 'Star', label: 'Destaques', icon: Star },
  { name: 'Crown', label: 'Premium', icon: Crown },
  { name: 'Palette', label: 'Arte', icon: Palette },
  { name: 'BookOpen', label: 'Cadernos', icon: BookOpen },
  { name: 'BadgeCheck', label: 'Eventos', icon: BadgeCheck },
];

export const renderCategoryIcon = (iconName: string, size = 24): ReactNode => {
  const option = CATEGORY_ICON_OPTIONS.find((item) => item.name === iconName) || CATEGORY_ICON_OPTIONS[0];
  const Icon = option.icon;
  return <Icon size={size} />;
};
