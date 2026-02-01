// List of blocked patterns for Instagram-like guidelines
const BLOCKED_PATTERNS = {
  // Hate speech patterns
  hate: [
    /\b(n[i1]gg[ae3]r?s?|f[a@]gg?[o0]ts?|k[i1]ke?s?|sp[i1]c?s?|ch[i1]nks?)\b/gi,
    /\b(white\s*power|heil\s*hitler|nazi)\b/gi,
  ],
  // Bullying/harassment
  harassment: [
    /\b(kill\s*yourself|kys|go\s*die|hope\s*you\s*die)\b/gi,
    /\b(i('ll|will)\s*(find|hurt|kill|beat)\s*(you|ur))\b/gi,
  ],
  // Sexual/explicit content
  sexual: [
    /\b(nude?s?|d[i1]ck\s*p[i1]c|send\s*nudes?|sex\s*tape)\b/gi,
    /\b(p[o0]rn|xxx|f[u\*]ck\s*me)\b/gi,
  ],
  // Violence/threats
  violence: [
    /\b(i('ll|will)\s*(shoot|stab|murder|bomb))\b/gi,
    /\b(school\s*shoot|mass\s*shoot|terror)\b/gi,
  ],
  // Self-harm
  selfHarm: [
    /\b(cut\s*myself|suicid|hang\s*myself|end\s*my\s*life)\b/gi,
  ],
  // Illegal activities
  illegal: [
    /\b(buy\s*(drugs?|weed|cocaine|meth)|sell\s*(drugs?))\b/gi,
    /\b(child\s*p[o0]rn|cp|underage)\b/gi,
  ],
};

export type ModerationResult = {
  isAllowed: boolean;
  reason?: string;
  category?: string;
};

export function moderateContent(content: string): ModerationResult {
  const lowerContent = content.toLowerCase();

  for (const [category, patterns] of Object.entries(BLOCKED_PATTERNS)) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content) || pattern.test(lowerContent)) {
        const categoryLabels: Record<string, string> = {
          hate: "hate speech",
          harassment: "bullying or harassment",
          sexual: "sexual or explicit content",
          violence: "violent threats",
          selfHarm: "self-harm content",
          illegal: "illegal activity",
        };

        return {
          isAllowed: false,
          reason: `This message contains ${categoryLabels[category] || "inappropriate content"} which violates campus community guidelines.`,
          category,
        };
      }
    }
  }

  return { isAllowed: true };
}
