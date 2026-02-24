export const LANG = {
  EN: "en-IN",
  HI: "hi-IN",
};

export const UI_TEXT = {
  [LANG.EN]: {
    appTitle: "Ashish AI",
    appSubTitle: "Voice-first smart assistant",
    greeting: "Hello! Ask anything. I can answer in English or Hindi.",
    placeholderTyping: "Type your message...",
    placeholderListening: "Listening... speak now",
    thinking: "Thinking...",
    listen: "Listen",
    stop: "Stop",
    micOn: "Stop Mic",
    micOff: "Voice",
    unsupportedVoice: "Your browser does not support voice input. Use Chrome.",
    fallback: "Sorry, I could not generate a response.",
    serverError: "Server error. Please check backend connection.",
    languageToggle: "Lang",
  },
  [LANG.HI]: {
    appTitle: "Ashish AI",
    appSubTitle: "Voice-first smart assistant",
    greeting:
      "नमस्ते! आप कुछ भी पूछ सकते हैं। मैं Hindi या English में जवाब दूँगा।",
    placeholderTyping: "अपना सवाल लिखें...",
    placeholderListening: "सुन रहा हूँ... अब बोलिए",
    thinking: "सोच रहा हूँ...",
    listen: "सुनें",
    stop: "रोकें",
    micOn: "Mic बंद",
    micOff: "Voice",
    unsupportedVoice:
      "आपका browser voice input support नहीं करता। कृपया Chrome use करें।",
    fallback: "क्षमा करें, जवाब तैयार नहीं हो पाया।",
    serverError: "Server error. Backend connection check करें।",
    languageToggle: "भाषा",
  },
};

export const INPUT_ALLOWED_REGEX = /[^\p{Script=Devanagari}A-Za-z0-9\s.,!?;:'"()-]/gu;
export const OUTPUT_ALLOWED_REGEX = /[^\p{Script=Devanagari}A-Za-z0-9\s.,!?;:'"()*:\n.\u2022\u0964-]/gu;
export const ROMAN_HINDI_HINT_REGEX =
  /\b(kya|kaise|kyu|kyon|namaste|dhanyavad|aap|mujhe|mera|meri|hai|nahi|haan|kripya|samjhao|batayo|batao|iska|isme)\b/i;
