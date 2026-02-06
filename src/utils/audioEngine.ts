// 8-bit Sound Engine - Web Audio API based chiptune audio engine

type WaveformType = "square" | "triangle" | "sawtooth";

type NoteName =
  | "C" | "C#" | "D" | "D#" | "E" | "F"
  | "F#" | "G" | "G#" | "A" | "A#" | "B";

const NOTE_SEMITONE_MAP: Record<NoteName, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5,
  "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};

export function noteToFreq(note: NoteName, octave: number): number {
  const semitone = NOTE_SEMITONE_MAP[note];
  const midiNote = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

const ATTACK_TIME = 0.008;
const RELEASE_TIME = 0.04;

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;

  async init(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  getContext(): AudioContext | null {
    return this.context;
  }

  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.context) {
      const now = this.context.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, now);
    }
  }

  playNote(
    freq: number,
    duration: number,
    type: WaveformType = "square",
    volume: number = 0.3,
    detune: number = 0
  ): void {
    if (!this.context || !this.masterGain) return;

    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, now);
    if (detune !== 0) {
      oscillator.detune.setValueAtTime(detune, now);
    }

    const noteGain = this.context.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + ATTACK_TIME);

    const holdEnd = now + duration - RELEASE_TIME;
    if (holdEnd > now + ATTACK_TIME) {
      noteGain.gain.setValueAtTime(volume, holdEnd);
    }

    const releaseEnd = now + duration;
    noteGain.gain.linearRampToValueAtTime(0, releaseEnd);

    oscillator.connect(noteGain);
    noteGain.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(releaseEnd + 0.01);

    oscillator.onended = () => {
      oscillator.disconnect();
      noteGain.disconnect();
    };
  }

  playNoise(duration: number, volume: number = 0.3): void {
    if (!this.context || !this.masterGain) return;

    const now = this.context.currentTime;
    const sampleRate = this.context.sampleRate;
    const bufferLength = Math.ceil(sampleRate * (duration + 0.05));

    const noiseBuffer = this.context.createBuffer(1, bufferLength, sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferLength; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(volume, now + ATTACK_TIME);

    const releaseEnd = now + duration;
    noiseGain.gain.exponentialRampToValueAtTime(0.001, releaseEnd);
    noiseGain.gain.setValueAtTime(0, releaseEnd + 0.001);

    noiseSource.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(releaseEnd + 0.02);

    noiseSource.onended = () => {
      noiseSource.disconnect();
      noiseGain.disconnect();
    };
  }
}

export const audioEngine = new AudioEngine();
