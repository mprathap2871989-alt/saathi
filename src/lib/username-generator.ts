// src/lib/username-generator.ts
// Generates warm, anonymous usernames like "BraveSoul123"
// Used when a new user signs up via Clerk.

const ADJECTIVES = [
  "Brave", "Gentle", "Quiet", "Rising", "Hopeful", "Tender",
  "Peaceful", "Silver", "Golden", "Steady", "Warm", "Calm",
  "New", "Patient", "Kind", "Soft", "Still", "Open",
  "Growing", "Healing", "Seeking", "Learning", "Moving",
  "Strong", "Light", "Dawn", "Spring", "Clear", "Humble",
];

const NOUNS = [
  "Soul", "Mind", "Heart", "Path", "Wave", "Leaf",
  "Star", "Dawn", "Voice", "Step", "Light", "Spark",
  "Wind", "Root", "Branch", "River", "Stone", "Cloud",
  "Flame", "Shore", "Bridge", "Garden", "Forest", "Meadow",
  "Sky", "Rain", "Sun", "Moon", "Horizon", "Journey",
];

/**
 * Generates a username like "BraveSoul123"
 * The number suffix ensures uniqueness.
 */
export function generateUsername(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num  = Math.floor(Math.random() * 900) + 10; // 10–909
  return `${adj}${noun}${num}`;
}

/**
 * Generates a username and checks DB uniqueness.
 * Retries up to 10 times before appending timestamp.
 */
export async function generateUniqueUsername(
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateUsername();
    const exists = await checkExists(candidate);
    if (!exists) return candidate;
  }
  // Fallback: very unlikely to collide
  return `${generateUsername()}${Date.now().toString().slice(-4)}`;
}
