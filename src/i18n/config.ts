// src/i18n/config.ts
// Internationalization architecture — English default, Hindi ready.
// To activate: wrap layout with NextIntlClientProvider (next-intl).
// For MVP: all strings are in en.json; hi.json stubs are ready.

export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिंदी",
};

/**
 * Minimal translation helper for MVP — no external dependency needed.
 * Replace with next-intl when you're ready to ship Hindi.
 *
 * Usage:
 *   const t = useTranslations("community");
 *   t("feed.title")  // → "Community"
 */
export function getTranslations(locale: Locale = DEFAULT_LOCALE) {
  // Lazy load: in production replace with proper file loading
  const messages = locale === "hi" ? hiMessages : enMessages;

  return function t(key: string): string {
    const keys = key.split(".");
    let current: Record<string, unknown> = messages;
    for (const k of keys) {
      if (typeof current[k] === "string") return current[k] as string;
      if (typeof current[k] === "object") {
        current = current[k] as Record<string, unknown>;
      } else {
        return key; // fallback: return the key itself
      }
    }
    return key;
  };
}

// Inline for MVP — move to JSON imports when adding next-intl
const enMessages = {
  common: {
    shareStory: "Share Your Story",
    community: "Community",
    helpful: "Helpful",
    report: "Report",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading…",
    backToCommunity: "Back to community",
    anonymous: "Anonymous",
  },
  home: {
    hero: {
      headline: "You don't have to figure everything out alone.",
      subheadline: "Share your story. Find people who understand. Give and receive support — completely anonymously.",
    },
    howItWorks: "How Saathi Works",
    findCommunity: "Find Your Community",
    recentStories: "Recent Stories",
    safetyPromise: "Your Safety Is Our Promise",
  },
  community: {
    feed: { title: "Community", allTopics: "All Topics" },
    empty: { hasFilters: "No stories match your search", noFilters: "No stories yet" },
  },
  post: {
    markHelpful: "Helpful",
    addComment: "Share Support",
    commentPlaceholder: "Share a supportive response…",
    responses: "Responses",
    reportContent: "Report Content",
  },
  create: {
    title: "Share Your Story",
    subtitle: "You'll post anonymously. No one will know your real identity.",
    labels: {
      category: "Category",
      title: "What's happening?",
      story: "Tell us more",
    },
    submit: "Share Your Story",
    anonymous: "Posting as",
  },
  guidelines: {
    title: "Community Guidelines",
    subtitle: "Saathi works because people choose kindness.",
  },
  crisis: {
    label: "In crisis or feeling unsafe?",
    action: "Please call iCall:",
    hours: "(Mon–Sat, 8am–10pm)",
    suffix: "You are not alone.",
  },
};

// Hindi stubs — translate before activating Hindi locale
const hiMessages: typeof enMessages = {
  common: {
    shareStory: "अपनी कहानी साझा करें",
    community: "समुदाय",
    helpful: "सहायक",
    report: "रिपोर्ट",
    submit: "जमा करें",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है…",
    backToCommunity: "समुदाय पर वापस",
    anonymous: "गुमनाम",
  },
  home: {
    hero: {
      headline: "आपको अकेले सब कुछ समझने की जरूरत नहीं है।",
      subheadline: "अपनी कहानी साझा करें। ऐसे लोगों को ढूंढें जो समझते हैं।",
    },
    howItWorks: "साथी कैसे काम करता है",
    findCommunity: "अपना समुदाय खोजें",
    recentStories: "हाल की कहानियाँ",
    safetyPromise: "आपकी सुरक्षा हमारा वादा है",
  },
  community: {
    feed: { title: "समुदाय", allTopics: "सभी विषय" },
    empty: { hasFilters: "कोई कहानी नहीं मिली", noFilters: "अभी तक कोई कहानी नहीं" },
  },
  post: {
    markHelpful: "सहायक",
    addComment: "समर्थन साझा करें",
    commentPlaceholder: "एक सहायक प्रतिक्रिया साझा करें…",
    responses: "प्रतिक्रियाएं",
    reportContent: "सामग्री रिपोर्ट करें",
  },
  create: {
    title: "अपनी कहानी साझा करें",
    subtitle: "आप गुमनाम रूप से पोस्ट करेंगे।",
    labels: { category: "श्रेणी", title: "क्या हो रहा है?", story: "और बताएं" },
    submit: "अपनी कहानी साझा करें",
    anonymous: "के रूप में पोस्ट करना",
  },
  guidelines: {
    title: "सामुदायिक दिशानिर्देश",
    subtitle: "साथी काम करता है क्योंकि लोग दयालुता चुनते हैं।",
  },
  crisis: {
    label: "संकट में हैं?",
    action: "कृपया iCall पर कॉल करें:",
    hours: "(सोम–शनि, सुबह 8 – रात 10)",
    suffix: "आप अकेले नहीं हैं।",
  },
};
