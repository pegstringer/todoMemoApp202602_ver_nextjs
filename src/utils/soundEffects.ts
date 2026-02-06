import { audioEngine, noteToFreq } from "./audioEngine";

// Todo追加 - 明るい上昇アルペジオ (C5→E5→G5)
export function playSfxAdd(): void {
  if (audioEngine.isMuted()) return;
  const notes: [string, number, number][] = [
    ["C", 5, 0],
    ["E", 5, 80],
    ["G", 5, 160],
  ];
  for (const [note, oct, delay] of notes) {
    setTimeout(() => {
      audioEngine.playNote(
        noteToFreq(note as "C" | "E" | "G", oct),
        0.1, "square", 0.15
      );
    }, delay);
  }
}

// Todo完了 - 達成感のある2音チャイム (G5→C6)
export function playSfxComplete(): void {
  if (audioEngine.isMuted()) return;
  audioEngine.playNote(noteToFreq("G", 5), 0.12, "square", 0.18);
  setTimeout(() => {
    audioEngine.playNote(noteToFreq("C", 6), 0.18, "square", 0.2);
  }, 120);
}

// Todo未完了に戻す - 下降2音 (C6→G5)
export function playSfxUncomplete(): void {
  if (audioEngine.isMuted()) return;
  audioEngine.playNote(noteToFreq("C", 6), 0.1, "triangle", 0.12);
  setTimeout(() => {
    audioEngine.playNote(noteToFreq("G", 5), 0.12, "triangle", 0.1);
  }, 100);
}

// Todo削除 - 下降ピッチスウィープ (C5→C4)
export function playSfxDelete(): void {
  if (audioEngine.isMuted()) return;
  const startFreq = noteToFreq("C", 5);
  const endFreq = noteToFreq("C", 4);
  const steps = 8;
  const totalDuration = 150;
  const stepDuration = totalDuration / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const frequency = startFreq + (endFreq - startFreq) * t;
    setTimeout(() => {
      audioEngine.playNote(
        frequency, stepDuration / 1000 + 0.02,
        "square", 0.15 * (1 - t * 0.5)
      );
    }, i * stepDuration);
  }
}

// メモ編集開始 - 柔らかいクリック音
export function playSfxToggleMemo(): void {
  if (audioEngine.isMuted()) return;
  audioEngine.playNote(noteToFreq("A", 4), 0.05, "triangle", 0.12);
}

// メモ保存 - 優しい確認音 (E5→G5)
export function playSfxSaveMemo(): void {
  if (audioEngine.isMuted()) return;
  audioEngine.playNote(noteToFreq("E", 5), 0.1, "triangle", 0.15);
  setTimeout(() => {
    audioEngine.playNote(noteToFreq("G", 5), 0.12, "triangle", 0.18);
  }, 100);
}

// フィルター変更 - フィルタータイプごとに異なるピッチのティック音
export function playSfxFilter(filterType: "all" | "active" | "completed"): void {
  if (audioEngine.isMuted()) return;
  const pitchMap = { all: 4, active: 5, completed: 5 } as const;
  const noteMap = { all: "C" as const, active: "E" as const, completed: "G" as const };
  audioEngine.playNote(
    noteToFreq(noteMap[filterType], pitchMap[filterType]),
    0.04, "square", 0.1
  );
}
