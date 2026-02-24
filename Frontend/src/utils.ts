import { LANG, INPUT_ALLOWED_REGEX, OUTPUT_ALLOWED_REGEX, ROMAN_HINDI_HINT_REGEX } from "./constants";

/**
 * Generate a reasonably unique message id.
 */
export function createMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Strip any unwanted characters from user input (typing or speech).
 */
export function sanitizeInputText(text: string): string {
  return String(text || "").replace(INPUT_ALLOWED_REGEX, "").trim();
}

/**
 * Clean model output before rendering or speaking.
 */
export function sanitizeOutputText(text: string): string {
  return String(text || "").replace(OUTPUT_ALLOWED_REGEX, "").trim();
}

/**
 * Very simple heuristic to detect whether a string should be handled as Hindi
 * or English.  Checks for Devanagari characters or some common roman-hindi
 * words. Defaults to English.
 */
export function detectLanguage(text: string): string {
  if (!text) return LANG.EN;
  // match Devanagari block explicitly
  if (/\p{Script=Devanagari}/u.test(text) || ROMAN_HINDI_HINT_REGEX.test(text)) {
    return LANG.HI;
  }
  return LANG.EN;
}

/**
 * Pick a voice from the list that best matches the requested language.
 * Falls back to any available voice if there's no exact match.
 */
export function pickVoice(
  voices: SpeechSynthesisVoice[] = [],
  language: string
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  const langLower = language.toLowerCase();

  // try for exact prefix match
  let match = voices.find((v) =>
    v.lang.toLowerCase().startsWith(langLower)
  );
  if (match) return match;

  // fall back to english
  match = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  if (match) return match;

  // otherwise just return the first voice
  return voices[0];
}

/**
 * Break up a model response into "blocks" for rendering.  Bullet-list
 * detection is extremely naive but good enough for most simple replies.
 */
export function parseMessageBlocks(
  text: string,
  opts: { forcePoints?: boolean } = {}
): Array<{ type: "text"; text: string } | { type: "list"; items: string[] }> {
  const lines = text.split("\n");
  const blocks: any[] = [];
  let currentList: { type: "list"; items: string[] } | null = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList) {
        currentList = { type: "list", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({ type: "text", text: line });
    }
  });
  if (currentList) blocks.push(currentList);
  return blocks;
}
