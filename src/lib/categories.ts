// src/lib/categories.ts
// Single source of truth for categories and their UI colors.

export const CATEGORIES = [
  { id: "students",  label: "Students",         emoji: "📚", color: "blue",   desc: "Exams, academic stress, college life"  },
  { id: "career",    label: "Career & Jobs",    emoji: "💼", color: "indigo", desc: "Job loss, career confusion, workplace" },
  { id: "relations", label: "Relationships",    emoji: "💛", color: "rose",   desc: "Heartbreak, dating, boundaries"        },
  { id: "family",    label: "Family Issues",    emoji: "🏠", color: "orange", desc: "Conflicts, estrangement, dynamics"     },
  { id: "mens",      label: "Men's Support",    emoji: "🧭", color: "cyan",   desc: "Challenges men navigate alone"         },
  { id: "womens",    label: "Women's Support",  emoji: "🌸", color: "pink",   desc: "Women supporting women"                },
  { id: "lgbtq",     label: "LGBTQ+ Support",   emoji: "🌈", color: "purple", desc: "Identity, acceptance, safety"          },
  { id: "elderly",   label: "Elderly Support",  emoji: "🌻", color: "yellow", desc: "Isolation, aging, wisdom"              },
  { id: "grief",     label: "Grief & Loss",     emoji: "🕊️", color: "slate",  desc: "Loss, bereavement, healing"            },
  { id: "financial", label: "Financial Stress", emoji: "🌱", color: "green",  desc: "Debt, hardship, recovery"              },
  { id: "parenting", label: "Parenting",        emoji: "👶", color: "amber",  desc: "Parenting challenges and joys"         },
  { id: "mental",    label: "Mental Wellness",  emoji: "🧘", color: "teal",   desc: "Anxiety, depression, coping"           },
  { id: "other",     label: "Other",            emoji: "💬", color: "gray",   desc: "Everything else"                       },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];

// Tailwind class maps — must use full strings (no dynamic construction)
export const CATEGORY_COLORS: Record<string, {
  badge: string;
  border: string;  // left border for cards
  soft:   string;  // soft background
  ring:   string;  // avatar ring
}> = {
  blue:   { badge: "bg-blue-100 text-blue-700",     border: "border-l-blue-400",   soft: "bg-blue-50",   ring: "ring-blue-300"   },
  indigo: { badge: "bg-indigo-100 text-indigo-700", border: "border-l-indigo-400", soft: "bg-indigo-50", ring: "ring-indigo-300" },
  rose:   { badge: "bg-rose-100 text-rose-700",     border: "border-l-rose-400",   soft: "bg-rose-50",   ring: "ring-rose-300"   },
  orange: { badge: "bg-orange-100 text-orange-700", border: "border-l-orange-400", soft: "bg-orange-50", ring: "ring-orange-300" },
  cyan:   { badge: "bg-cyan-100 text-cyan-700",     border: "border-l-cyan-400",   soft: "bg-cyan-50",   ring: "ring-cyan-300"   },
  pink:   { badge: "bg-pink-100 text-pink-700",     border: "border-l-pink-400",   soft: "bg-pink-50",   ring: "ring-pink-300"   },
  purple: { badge: "bg-purple-100 text-purple-700", border: "border-l-purple-400", soft: "bg-purple-50", ring: "ring-purple-300" },
  yellow: { badge: "bg-yellow-100 text-yellow-700", border: "border-l-yellow-400", soft: "bg-yellow-50", ring: "ring-yellow-300" },
  slate:  { badge: "bg-slate-100 text-slate-600",   border: "border-l-slate-400",  soft: "bg-slate-50",  ring: "ring-slate-300"  },
  green:  { badge: "bg-green-100 text-green-700",   border: "border-l-green-400",  soft: "bg-green-50",  ring: "ring-green-300"  },
  amber:  { badge: "bg-amber-100 text-amber-700",   border: "border-l-amber-400",  soft: "bg-amber-50",  ring: "ring-amber-300"  },
  teal:   { badge: "bg-teal-100 text-teal-700",     border: "border-l-teal-400",   soft: "bg-teal-50",   ring: "ring-teal-300"   },
  gray:   { badge: "bg-gray-100 text-gray-600",     border: "border-l-gray-400",   soft: "bg-gray-50",   ring: "ring-gray-300"   },
};

export function getCategoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryColors(id: string) {
  const cat = getCategoryById(id);
  return CATEGORY_COLORS[cat.color];
}
