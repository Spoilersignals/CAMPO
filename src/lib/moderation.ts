// Content moderation utilities for campus chat and other features

// Common abusive/inappropriate words - extend as needed
const BANNED_WORDS = [
  // Profanity (common)
  "fuck", "shit", "bitch", "ass", "damn", "bastard", "crap", "dick", "cock", "pussy",
  "whore", "slut", "fag", "faggot", "nigger", "nigga", "retard", "retarded",
  // Hate speech
  "kill yourself", "kys", "go die", "hope you die",
  // Harassment
  "ugly bitch", "fat ass", "stupid idiot",
  // Sexual
  "send nudes", "sex", "porn", "nude", "naked",
  // Swahili profanity (common in Kenya)
  "malaya", "mavi", "matako", "shenzi", "mjinga",
];

// Words that might be okay in context but should be flagged
const FLAGGED_WORDS = [
  "hate", "kill", "die", "stupid", "idiot", "dumb", "ugly", "fat", "loser",
];

// Regex patterns for more complex matching
const ABUSE_PATTERNS = [
  /\bk+y+s+\b/i, // kys with variations
  /\bf+u+c+k+/i, // fuck with variations
  /\bs+h+i+t+/i, // shit with variations
  /\bn+[i1]+g+[g@]+[a@e]+r?/i, // n-word with l33t speak
  /\bf+[a@]+g+[o0]+t?/i, // slur with l33t speak
];

/**
 * Check if text contains abusive content
 */
export function containsAbusiveContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check exact word matches
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  // Check regex patterns
  for (const pattern of ABUSE_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if text contains potentially flagged content (less severe)
 */
export function containsFlaggedContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  for (const word of FLAGGED_WORDS) {
    // Match whole words only
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter and replace abusive content with asterisks
 */
export function filterAbusiveContent(text: string): string {
  let filtered = text;
  
  // Replace banned words
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  
  // Replace pattern matches
  for (const pattern of ABUSE_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }
  
  return filtered;
}

/**
 * Get severity level of content
 * @returns 'safe' | 'flagged' | 'blocked'
 */
export function getContentSeverity(text: string): 'safe' | 'flagged' | 'blocked' {
  if (containsAbusiveContent(text)) {
    return 'blocked';
  }
  if (containsFlaggedContent(text)) {
    return 'flagged';
  }
  return 'safe';
}

/**
 * Check if email ends with allowed domain for Kabarak University
 */
export function isKabarakEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@kabarak.ac.ke');
}

/**
 * Extract school/university from email domain
 */
export function getSchoolFromEmail(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  // Map email domains to school names
  const schoolMap: Record<string, string> = {
    'kabarak.ac.ke': 'Kabarak University',
    'students.kabarak.ac.ke': 'Kabarak University',
    'ku.ac.ke': 'Kenyatta University',
    'uonbi.ac.ke': 'University of Nairobi',
    'jkuat.ac.ke': 'JKUAT',
    'strathmore.edu': 'Strathmore University',
    'mku.ac.ke': 'Mount Kenya University',
  };
  
  return schoolMap[domain] || null;
}

/**
 * Admin email for receiving notifications
 */
export const ADMIN_EMAIL = 'comradezonecom@gmail.com';

/**
 * Daily message limit for anonymous users in campus chat
 */
export const ANONYMOUS_MESSAGE_LIMIT = 10;
