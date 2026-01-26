// Default banned words for group chat - prevents selling
export const DEFAULT_BANNED_WORDS = [
  "sell", "selling", "for sale", "buy", "buying", "price", "pricing",
  "dm me", "dm for", "contact me", "payment", "pay", "cash",
  "₦", "naira", "dollar", "$", "offer", "discount",
  "available", "in stock", "order", "purchase", "checkout",
  "whatsapp", "instagram", "ig", "check my", "link in bio"
];

export function containsBannedWords(message: string, bannedWords: string[] = DEFAULT_BANNED_WORDS): boolean {
  const lowerMessage = message.toLowerCase();
  return bannedWords.some(word => lowerMessage.includes(word.toLowerCase()));
}

export function getBannedWordsFound(message: string, bannedWords: string[] = DEFAULT_BANNED_WORDS): string[] {
  const lowerMessage = message.toLowerCase();
  return bannedWords.filter(word => lowerMessage.includes(word.toLowerCase()));
}
