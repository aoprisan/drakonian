// Spoken invocation via the Web Speech API. Reads a ritual step aloud so a
// working can be done hands-free, eyes closed. Everything is synthesized
// on-device — nothing is sent anywhere — and it no-ops silently where the API
// is unavailable (e.g. jsdom, older browsers).

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return 'speechSynthesis' in window ? window.speechSynthesis : null;
}

export function speechSupported(): boolean {
  return synth() !== null && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** Speak the given text, cancelling anything already in progress. */
export function speak(text: string): void {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') return;
  const clean = text.trim();
  if (!clean) return;
  try {
    s.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    // A slow, slightly low voice suits a spoken rite.
    u.rate = 0.92;
    u.pitch = 0.9;
    u.lang = 'en-US';
    s.speak(u);
  } catch {
    /* synthesis unavailable or refused; ignore */
  }
}

/** Silence any in-progress or queued speech. */
export function stopSpeaking(): void {
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
  } catch {
    /* ignore */
  }
}
