import { audioEngine } from "./audioEngine";

// 音階周波数テーブル (Hz)
const NOTE_FREQ: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

function freq(note: string): number {
  return NOTE_FREQ[note] ?? 0;
}

interface NoteEvent { note: string | null; steps: number; }
interface DrumEvent { type: "kick" | "hat" | null; steps: number; }

// コード進行: Cmaj7 → Am7 → Fmaj7 → G7 → Em7 → Am7 → Dm7 → G7
// 各コード = 1小節 = 16ステップ(16分音符), 計8小節 = 128ステップ

// Ch1: リードメロディ (矩形波) - ペンタトニック基調、ゆったりとした雰囲気
const MELODY: NoteEvent[] = [
  // Bar 1 - Cmaj7
  { note: "E5", steps: 4 }, { note: null, steps: 2 }, { note: "G4", steps: 2 },
  { note: "A4", steps: 4 }, { note: "G4", steps: 2 }, { note: "E4", steps: 2 },
  // Bar 2 - Am7
  { note: "C5", steps: 4 }, { note: "A4", steps: 2 }, { note: null, steps: 2 },
  { note: "G4", steps: 4 }, { note: "E4", steps: 4 },
  // Bar 3 - Fmaj7
  { note: "A4", steps: 2 }, { note: "C5", steps: 4 }, { note: null, steps: 2 },
  { note: "D5", steps: 4 }, { note: "C5", steps: 2 }, { note: "A4", steps: 2 },
  // Bar 4 - G7
  { note: "B4", steps: 4 }, { note: "D5", steps: 2 }, { note: null, steps: 2 },
  { note: "G4", steps: 6 }, { note: null, steps: 2 },
  // Bar 5 - Em7
  { note: "E4", steps: 4 }, { note: "G4", steps: 2 }, { note: "B4", steps: 2 },
  { note: null, steps: 4 }, { note: "A4", steps: 4 },
  // Bar 6 - Am7
  { note: "C5", steps: 2 }, { note: "E5", steps: 4 }, { note: "D5", steps: 2 },
  { note: "C5", steps: 4 }, { note: null, steps: 2 }, { note: "A4", steps: 2 },
  // Bar 7 - Dm7
  { note: "D4", steps: 4 }, { note: "A4", steps: 2 }, { note: "C5", steps: 2 },
  { note: "D5", steps: 4 }, { note: null, steps: 4 },
  // Bar 8 - G7
  { note: "B4", steps: 2 }, { note: "G4", steps: 4 }, { note: null, steps: 2 },
  { note: "D4", steps: 4 }, { note: "E4", steps: 2 }, { note: null, steps: 2 },
];

// Ch2: ベースライン (三角波) - ルート音とウォーキングベース
const BASS: NoteEvent[] = [
  // Bar 1 - Cmaj7
  { note: "C2", steps: 6 }, { note: null, steps: 2 },
  { note: "G2", steps: 4 }, { note: "E2", steps: 2 }, { note: "C3", steps: 2 },
  // Bar 2 - Am7
  { note: "A2", steps: 6 }, { note: null, steps: 2 },
  { note: "E3", steps: 4 }, { note: "A2", steps: 4 },
  // Bar 3 - Fmaj7
  { note: "F2", steps: 6 }, { note: null, steps: 2 },
  { note: "C3", steps: 4 }, { note: "A2", steps: 2 }, { note: "F2", steps: 2 },
  // Bar 4 - G7
  { note: "G2", steps: 6 }, { note: null, steps: 2 },
  { note: "D3", steps: 4 }, { note: "B2", steps: 2 }, { note: "G2", steps: 2 },
  // Bar 5 - Em7
  { note: "E2", steps: 6 }, { note: null, steps: 2 },
  { note: "B2", steps: 4 }, { note: "G2", steps: 2 }, { note: "E2", steps: 2 },
  // Bar 6 - Am7
  { note: "A2", steps: 6 }, { note: null, steps: 2 },
  { note: "E3", steps: 4 }, { note: "C3", steps: 2 }, { note: "A2", steps: 2 },
  // Bar 7 - Dm7
  { note: "D2", steps: 6 }, { note: null, steps: 2 },
  { note: "A2", steps: 4 }, { note: "F2", steps: 2 }, { note: "D3", steps: 2 },
  // Bar 8 - G7
  { note: "G2", steps: 6 }, { note: null, steps: 2 },
  { note: "D3", steps: 4 }, { note: "F2", steps: 2 }, { note: "G2", steps: 2 },
];

// Ch3: ドラム - キック(1,3拍)、ハイハット(8分音符)
const DRUM_BAR: DrumEvent[] = [
  { type: "kick", steps: 1 }, { type: "hat", steps: 1 },
  { type: "hat", steps: 1 }, { type: null, steps: 1 },
  { type: "hat", steps: 1 }, { type: null, steps: 1 },
  { type: "hat", steps: 1 }, { type: null, steps: 1 },
  { type: "kick", steps: 1 }, { type: "hat", steps: 1 },
  { type: "hat", steps: 1 }, { type: null, steps: 1 },
  { type: "hat", steps: 1 }, { type: null, steps: 1 },
  { type: "hat", steps: 1 }, { type: null, steps: 1 },
];

const DRUMS: DrumEvent[] = [];
for (let i = 0; i < 8; i++) {
  DRUMS.push(...DRUM_BAR);
}

// ステップインデックスのルックアップ構築
interface ScheduledNote { freq: number; durationSteps: number; }
interface ScheduledDrumHit { type: "kick" | "hat"; }

function buildNoteSchedule(events: NoteEvent[]): Map<number, ScheduledNote> {
  const schedule = new Map<number, ScheduledNote>();
  let step = 0;
  for (const ev of events) {
    if (ev.note !== null) {
      const f = freq(ev.note);
      if (f > 0) schedule.set(step, { freq: f, durationSteps: ev.steps });
    }
    step += ev.steps;
  }
  return schedule;
}

function buildDrumSchedule(events: DrumEvent[]): Map<number, ScheduledDrumHit[]> {
  const schedule = new Map<number, ScheduledDrumHit[]>();
  let step = 0;
  for (const ev of events) {
    if (ev.type !== null) {
      const existing = schedule.get(step) ?? [];
      existing.push({ type: ev.type });
      schedule.set(step, existing);
    }
    step += ev.steps;
  }
  return schedule;
}

const melodySchedule = buildNoteSchedule(MELODY);
const bassSchedule = buildNoteSchedule(BASS);
const drumSchedule = buildDrumSchedule(DRUMS);

const TOTAL_STEPS = 128;

class BGMPlayer {
  private playing: boolean = false;
  private schedulerTimer: number | null = null;
  private tempo: number = 85;
  private currentStep: number = 0;
  private readonly totalSteps: number = TOTAL_STEPS;
  private activeNodes: Array<{
    source: OscillatorNode | AudioBufferSourceNode;
    gain: GainNode;
  }> = [];

  private get stepDuration(): number {
    return 60 / this.tempo / 4;
  }

  private readonly LOOKAHEAD_SEC = 0.15;
  private readonly SCHEDULER_INTERVAL_MS = 50;
  private nextStepTime: number = 0;

  private scheduleNote(
    frequency: number, startTime: number, duration: number,
    type: OscillatorType, volume: number
  ): void {
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);

    const releaseStart = startTime + duration - 0.04;
    if (releaseStart > startTime + 0.015) {
      gain.gain.setValueAtTime(volume, releaseStart);
    }
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    const entry = { source: osc as OscillatorNode | AudioBufferSourceNode, gain };
    this.activeNodes.push(entry);
    osc.onended = () => {
      const idx = this.activeNodes.indexOf(entry);
      if (idx !== -1) this.activeNodes.splice(idx, 1);
      gain.disconnect();
    };
  }

  private scheduleKick(startTime: number, volume: number): void {
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.08);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.15);

    const entry = { source: osc as OscillatorNode | AudioBufferSourceNode, gain };
    this.activeNodes.push(entry);
    osc.onended = () => {
      const idx = this.activeNodes.indexOf(entry);
      if (idx !== -1) this.activeNodes.splice(idx, 1);
      gain.disconnect();
    };
  }

  private scheduleHiHat(startTime: number, volume: number): void {
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(8000, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(startTime);
    source.stop(startTime + 0.05);

    const entry = { source: source as OscillatorNode | AudioBufferSourceNode, gain };
    this.activeNodes.push(entry);
    source.onended = () => {
      const idx = this.activeNodes.indexOf(entry);
      if (idx !== -1) this.activeNodes.splice(idx, 1);
      filter.disconnect();
      gain.disconnect();
    };
  }

  private processStep(time: number): void {
    const dur = this.stepDuration;

    const melodyNote = melodySchedule.get(this.currentStep);
    if (melodyNote) {
      this.scheduleNote(melodyNote.freq, time, melodyNote.durationSteps * dur * 0.9, "square", 0.08);
    }

    const bassNote = bassSchedule.get(this.currentStep);
    if (bassNote) {
      this.scheduleNote(bassNote.freq, time, bassNote.durationSteps * dur * 0.85, "triangle", 0.12);
    }

    const drumHits = drumSchedule.get(this.currentStep);
    if (drumHits) {
      for (const hit of drumHits) {
        if (hit.type === "kick") this.scheduleKick(time, 0.06);
        else if (hit.type === "hat") this.scheduleHiHat(time, 0.04);
      }
    }

    this.currentStep = (this.currentStep + 1) % this.totalSteps;
  }

  private scheduler = (): void => {
    const ctx = audioEngine.getContext();
    if (!ctx) return;
    while (this.nextStepTime < ctx.currentTime + this.LOOKAHEAD_SEC) {
      this.processStep(this.nextStepTime);
      this.nextStepTime += this.stepDuration;
    }
  };

  start(): void {
    if (this.playing) return;
    if (audioEngine.isMuted()) return;
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    this.playing = true;
    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    this.scheduler();
    this.schedulerTimer = window.setInterval(this.scheduler, this.SCHEDULER_INTERVAL_MS);
  }

  stop(): void {
    if (!this.playing) return;
    this.playing = false;

    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    const ctx = audioEngine.getContext();
    const now = ctx?.currentTime ?? 0;
    for (const { source, gain } of this.activeNodes) {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        source.stop(now + 0.01);
      } catch {
        // already stopped
      }
    }
    this.activeNodes = [];
    this.currentStep = 0;
  }

  isActive(): boolean {
    return this.playing;
  }

  setTempo(bpm: number): void {
    if (bpm > 0 && bpm <= 300) this.tempo = bpm;
  }
}

export const bgmPlayer = new BGMPlayer();
