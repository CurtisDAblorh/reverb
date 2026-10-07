import type { Track } from "@/types/music";
import { GENRES } from "@/lib/genres";

/**
 * Browser audio for Reverb.
 *
 * - Demo tracks (and Spotify tracks without a preview) are synthesised live: a
 *   lookahead step sequencer plays drums, bass, pads and a lead voiced by the
 *   track's genre, seeded so each track has its own pattern.
 * - Spotify tracks with a 30s preview play through an <audio> element.
 *
 * The synth routes through an AnalyserNode so the visualiser reacts to real
 * frequency data; previews fall back to a tempo-synced procedural spectrum.
 */

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;

type Voices = { kick: boolean; snare: boolean; hats: boolean; pad: boolean; lead: number };

function voicesFor(track: Track): Voices {
  switch (track.genre) {
    case "ambient":
      return { kick: false, snare: false, hats: false, pad: true, lead: 0.15 };
    case "jazz":
      return { kick: false, snare: false, hats: true, pad: true, lead: 0.35 };
    case "lo-fi":
      return { kick: true, snare: true, hats: true, pad: true, lead: 0.2 };
    case "r&b":
      return { kick: true, snare: true, hats: true, pad: true, lead: 0.25 };
    default:
      return { kick: true, snare: true, hats: true, pad: false, lead: 0.3 + track.energy * 0.3 };
  }
}

function prng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10_000) / 10_000;
  };
}

export class AudioEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private analyser?: AnalyserNode;
  private noise?: AudioBuffer;
  private timer?: ReturnType<typeof setInterval>;
  private nextNoteTime = 0;
  private step = 0;
  private pattern: { bass: number[]; lead: (number | null)[] } = { bass: [], lead: [] };
  private track?: Track;
  private audioEl?: HTMLAudioElement;
  private volume = 0.7;
  private playing = false;

  get supported() {
    return typeof window !== "undefined" && "AudioContext" in window;
  }

  /** True when the visualiser is fed real FFT data. */
  get hasAnalyser() {
    return Boolean(this.analyser && this.playing && !this.track?.previewUrl);
  }

  private ensureContext() {
    if (this.ctx || !this.supported) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume * 0.5;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;
    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  load(track: Track) {
    if (this.track?.id === track.id) return;
    this.stop();
    this.track = track;
    this.step = 0;
    const rand = prng(track.coverSeed ^ track.bpm ^ (track.title.length * 7919));
    const scale = GENRES[track.genre].synth.scale;
    this.pattern = {
      bass: Array.from({ length: 4 }, () => scale[Math.floor(rand() * Math.min(3, scale.length))]),
      lead: Array.from({ length: 16 }, () =>
        rand() < voicesFor(track).lead ? scale[Math.floor(rand() * scale.length)] + 12 : null,
      ),
    };
    if (track.previewUrl) {
      this.audioEl = new Audio(track.previewUrl);
      this.audioEl.volume = this.volume;
    }
  }

  async play(positionMs = 0) {
    if (!this.track) return;
    this.playing = true;
    if (this.audioEl) {
      this.audioEl.currentTime = positionMs / 1000;
      await this.audioEl.play().catch(() => undefined);
      return;
    }
    this.ensureContext();
    if (!this.ctx) return;
    await this.ctx.resume();
    clearInterval(this.timer);
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), LOOKAHEAD_MS);
  }

  pause() {
    this.playing = false;
    this.audioEl?.pause();
    clearInterval(this.timer);
  }

  seek(positionMs: number) {
    if (this.audioEl) this.audioEl.currentTime = positionMs / 1000;
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(volume * 0.5, this.ctx.currentTime, 0.05);
    if (this.audioEl) this.audioEl.volume = volume;
  }

  stop() {
    this.pause();
    if (this.audioEl) {
      this.audioEl.src = "";
      this.audioEl = undefined;
    }
    this.track = undefined;
  }

  /** Fills `out` with 0-255 magnitudes. Returns false when data is synthetic. */
  getFrequencyData(out: Uint8Array<ArrayBuffer>, timeMs: number): boolean {
    if (this.hasAnalyser && this.analyser) {
      this.analyser.getByteFrequencyData(out);
      return true;
    }
    proceduralSpectrum(out, timeMs, this.track, this.playing);
    return false;
  }

  private schedule() {
    const ctx = this.ctx;
    const track = this.track;
    if (!ctx || !track) return;
    const { swing } = GENRES[track.genre].synth;
    const sixteenth = 60 / track.bpm / 4;
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const offset = this.step % 2 === 1 ? sixteenth * swing : 0;
      this.playStep(this.step, this.nextNoteTime + offset, track, sixteenth);
      this.nextNoteTime += sixteenth;
      this.step = (this.step + 1) % 64;
    }
  }

  private playStep(step: number, time: number, track: Track, sixteenth: number) {
    const v = voicesFor(track);
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const { root, wave } = GENRES[track.genre].synth;
    const hz = (semi: number) => root * 2 ** (semi / 12);

    const fourOnFloor = track.genre === "electronic" || track.genre === "pop";
    if (v.kick && (fourOnFloor ? s % 4 === 0 : s === 0 || s === 10)) this.kick(time);
    if (v.snare && (s === 4 || s === 12)) this.snare(time);
    if (v.hats && s % 2 === 0) this.hat(time, s % 4 === 2 ? 0.08 : 0.04);
    if (s % 4 === 0)
      this.tone(hz(this.pattern.bass[bar % 4] - 12), time, sixteenth * 3, "triangle", 0.22);
    if (v.pad && s === 0) {
      const base = this.pattern.bass[bar % 4];
      [0, 4, 7].forEach((i) => this.tone(hz(base + i), time, sixteenth * 16, "sine", 0.05, 0.4));
    }
    const lead = this.pattern.lead[s];
    if (lead !== null) this.tone(hz(lead), time, sixteenth * 1.6, wave, 0.05 + track.energy * 0.04);
  }

  private tone(
    freq: number,
    time: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    attack = 0.01,
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(gain, time + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(filter).connect(env).connect(this.master!);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  private kick(time: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    env.gain.setValueAtTime(0.9, time);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    osc.connect(env).connect(this.master!);
    osc.start(time);
    osc.stop(time + 0.32);
  }

  private noiseHit(time: number, dur: number, gain: number, type: BiquadFilterType, freq: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise!;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, time);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filter).connect(env).connect(this.master!);
    src.start(time, Math.random() * 0.5);
    src.stop(time + dur + 0.02);
  }

  private snare(time: number) {
    this.noiseHit(time, 0.18, 0.35, "bandpass", 1800);
  }

  private hat(time: number, gain: number) {
    this.noiseHit(time, 0.05, gain, "highpass", 7000);
  }
}

/** Tempo-synced fake spectrum for previews, SSR and paused states. */
export function proceduralSpectrum(
  out: Uint8Array,
  timeMs: number,
  track: Track | undefined,
  playing: boolean,
) {
  const bpm = track?.bpm ?? 90;
  const energy = track?.energy ?? 0.3;
  const beat = (timeMs / 1000) * (bpm / 60);
  const kick = Math.max(0, 1 - (beat % 1) * 3);
  for (let i = 0; i < out.length; i++) {
    const x = i / out.length;
    const base = playing ? (1 - x) * 150 * (0.5 + energy) : 18 * (1 - x);
    const wobble = Math.sin(timeMs / 300 + i * 0.6) * 18 + Math.sin(timeMs / 170 + i * 1.7) * 10;
    const thump = playing ? kick * 90 * (1 - x) ** 2 : 0;
    out[i] = Math.max(0, Math.min(255, base + (playing ? wobble : wobble * 0.2) + thump));
  }
}

/**
 * Maps display bar `i` of `bars` onto an FFT bin on a log scale, so low
 * frequencies (where most musical energy sits) get more bars.
 */
export function logBin(i: number, bars: number, binCount: number) {
  const usable = binCount * 0.7;
  return Math.min(binCount - 1, Math.floor(Math.expm1((i / bars) * Math.log1p(usable))));
}

let singleton: AudioEngine | undefined;
export function getAudioEngine() {
  singleton ??= new AudioEngine();
  return singleton;
}
