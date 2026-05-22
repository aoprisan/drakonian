// Ambient ritual drone generated entirely with the Web Audio API — no audio
// files, so it works offline and adds nothing to the bundle. Detuned low
// oscillators through a slow filter sweep and a generated reverb. Must be
// started from a user gesture (browser autoplay policy).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let voices: OscillatorNode[] = [];
let lfo: OscillatorNode | null = null;
let running = false;

function makeImpulseResponse(context: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = context.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = context.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export function isRunning(): boolean {
  return running;
}

export async function startDrone(): Promise<void> {
  if (running) return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = ctx ?? new AC();
  if (ctx.state === 'suspended') await ctx.resume();

  const now = ctx.currentTime;

  master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.16, now + 6);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 320;
  filter.Q.value = 6;

  // Slow filter sweep for movement.
  lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 140;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulseResponse(ctx, 4.5, 2.4);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  const dry = ctx.createGain();
  dry.gain.value = 0.7;

  // A low drone chord: root, fifth, and a detuned octave.
  const freqs = [55, 82.4, 110.2];
  voices = freqs.map((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = i === 2 ? 'triangle' : 'sawtooth';
    osc.frequency.value = f;
    osc.detune.value = (i - 1) * 6;
    const g = ctx!.createGain();
    g.gain.value = i === 0 ? 0.6 : 0.35;
    osc.connect(g).connect(filter);
    osc.start();
    return osc;
  });

  filter.connect(dry).connect(master);
  filter.connect(reverb).connect(wet).connect(master);
  master.connect(ctx.destination);

  running = true;
}

export function stopDrone(): void {
  if (!ctx || !running) return;
  const now = ctx.currentTime;
  if (master) master.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  const toStop = [...voices, lfo].filter(Boolean) as OscillatorNode[];
  for (const osc of toStop) {
    try {
      osc.stop(now + 1.7);
    } catch {
      /* already stopped */
    }
  }
  voices = [];
  lfo = null;
  running = false;
}
