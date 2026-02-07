# BGM・SE生成レポート

ToDoメモアプリに8bitモダンなBGMとサウンドエフェクト(SE)を実装した全プロセスの記録。

---

## 1. 要件定義

### ユーザーの要望
> 「8bitだけどモダンな音楽で」

### 解釈と方針決定

「8bitだけどモダン」というオーダーから、以下のコンセプトを定義した:

- **8bit要素**: ファミコン/ゲームボーイ時代の矩形波・三角波・ノイズを基本音色とする
- **モダン要素**: コード進行にジャズ/lo-fi hiphop的なテンション(7thコード)を採用し、テンポをチルな85BPMに設定
- **アプリとの調和**: ToDoアプリの温かみのあるベージュ/ブラウン系UIに合う、穏やかで作業の邪魔にならないBGM

### 技術選定

外部音声ファイル(mp3等)ではなく、**Web Audio APIによるプログラム的音声生成**を採用した。

理由:
- 音声ファイルのダウンロード不要（バンドルサイズ増加なし）
- 8bit音色はオシレーターで忠実に再現可能
- パラメータ調整が容易（テンポ、音量、音色をコードで制御）
- ブラウザネイティブAPI、外部ライブラリ不要

---

## 2. アーキテクチャ設計

### エージェントチーム構成

3つの専門エージェントを**並列起動**し、独立したモジュールを同時開発した:

```
[エージェント1] audioEngine.ts   ← サウンドエンジン基盤
[エージェント2] soundEffects.ts  ← SE定義
[エージェント3] bgm.ts           ← BGM作曲

      ↓ 統合 (メインエージェント)

[useAudio.ts]          ← 状態管理フック
[AudioControls.tsx]    ← UIコンポーネント
[各コンポーネント改修]  ← SEトリガー埋め込み
```

### モジュール間の依存関係

```
audioEngine.ts (基盤・依存なし)
    ├── soundEffects.ts (audioEngineのplayNote/noteToFreqを使用)
    ├── bgm.ts (audioEngineのgetContext/isMutedを使用)
    └── useAudio.ts (audioEngine.init/setMuted + bgmPlayer.start/stopを使用)
            └── AudioControls.tsx (useAudioの状態とトグル関数を受け取る)
```

---

## 3. サウンドエンジンの構築

### `audioEngine.ts` — 音声生成の心臓部

#### Web Audio APIの信号フロー

```
OscillatorNode ──→ GainNode(個別エンベロープ) ──→ GainNode(マスター) ──→ destination(スピーカー)
```

#### 8bit音色の実現方法

| 波形 | Web Audio API | 8bit対応 | 用途 |
|------|---------------|----------|------|
| 矩形波 | `oscillator.type = "square"` | ファミコンのパルス波チャンネル | メロディ、SE |
| 三角波 | `oscillator.type = "triangle"` | ファミコンの三角波チャンネル | ベースライン |
| ノイズ | `AudioBuffer` + ランダムサンプル | ファミコンのノイズチャンネル | ドラム(キック、ハイハット) |

#### エンベロープ設計

クリックノイズ防止のため、各音にアタック/リリースエンベロープを適用:

```
音量
 ↑
 │    ┌──────────────┐
 │   /│              │\
 │  / │   サステイン   │ \
 │ /  │              │  \
 └─┼──┼──────────────┼──┼──→ 時間
   8ms                 40ms
  アタック            リリース
```

- **アタック**: 8ms — 瞬間的だが滑らかな立ち上がり
- **リリース**: 40ms — クリーンなカットオフ

#### 周波数計算

12平均律に基づくMIDIノート番号から周波数への変換:

```typescript
// A4 = 440Hz を基準に
frequency = 440 × 2^((midiNote - 69) / 12)
// midiNote = (octave + 1) × 12 + semitone
```

---

## 4. BGMの作曲プロセス

### Step 1: コード進行の選定

「モダンで温かみのある」雰囲気を実現するため、ジャズ/lo-fi系のセブンスコード進行を採用:

```
| Cmaj7 | Am7  | Fmaj7 | G7   |
| Em7   | Am7  | Dm7   | G7   |
```

**選定理由**:
- Cmaj7のメジャー7thが温かく柔らかい響きを生む
- Am7→Fmaj7の進行がlo-fi hiphopの定番で「チル」な雰囲気
- Em7での一時的な暗転が曲に深みを加える
- 最後のDm7→G7がドミナントモーションでループの起点に自然に回帰

### Step 2: テンポとリズム設計

```
テンポ: 85 BPM
拍子:  4/4
分解能: 16分音符 (1ステップ = 60/85/4 ≈ 0.176秒)
ループ長: 8小節 × 16ステップ = 128ステップ (約22.6秒)
```

85BPMはlo-fi hiphopの典型的なテンポ帯(75-90BPM)に位置し、作業用BGMとして最適。

### Step 3: 3チャンネルの編曲

NES(ファミコン)の音源構成を参考に、3チャンネル構成とした:

#### Ch1: リードメロディ (矩形波, volume: 0.08)

ペンタトニックスケール(C, D, E, G, A)を基調に、コードトーンを織り交ぜた穏やかなメロディ:

```
Bar 1 (Cmaj7):  E5--- .  G4  A4--- G4  E4
Bar 2 (Am7)  :  C5--- A4  .  G4--- E4---
Bar 3 (Fmaj7):  A4 C5---  .  D5--- C5  A4
Bar 4 (G7)   :  B4--- D5  .  G4-----  .
Bar 5 (Em7)  :  E4--- G4  B4  .--- A4---
Bar 6 (Am7)  :  C5 E5--- D5  C5---  .  A4
Bar 7 (Dm7)  :  D4--- A4  C5  D5---  .---
Bar 8 (G7)   :  B4 G4---  .  D4--- E4  .
```

**設計意図**:
- 4分音符と8分音符を混在させ、単調さを回避
- 適度な休符(`null`)で「息をする」ような余白を作る
- 各小節のコードトーンを意識しつつ、経過音で滑らかに接続
- Bar 8の末尾E4がBar 1のE5へオクターブで回帰し、ループが自然

#### Ch2: ベースライン (三角波, volume: 0.12)

各コードのルート音を基軸に、ウォーキングベスパターンを導入:

```
Bar 1 (Cmaj7):  C2----- .  G2--- E2  C3
Bar 2 (Am7)  :  A2----- .  E3--- A2---
Bar 3 (Fmaj7):  F2----- .  C3--- A2  F2
Bar 4 (G7)   :  G2----- .  D3--- B2  G2
...
```

**設計意図**:
- 1拍目にルート音を6ステップ(付点4分音符相当)置き、安定感を確保
- 後半でコードの5度や3度に動き、ウォーキングベース的な動きを演出
- オクターブジャンプ(C2→C3)でリズミカルなアクセント

#### Ch3: ドラム (ノイズ, kick: 0.06, hat: 0.04)

ミニマルなパターンで空間を活かす:

```
16分音符: |K H . H . . H . |K H . H . . H . |
          |1 + 2 + 3 + 4 + |  (各小節同一パターン)
```
- **K** = キック (sine波 150Hz→40Hzのピッチスウィープ)
- **H** = ハイハット (ホワイトノイズ + 8kHz ハイパスフィルター, 40ms)

**設計意図**:
- 1拍目と3拍目のキックで4/4の骨格を維持
- 8分音符刻みのハイハットで軽やかなグルーヴ
- 音量を極力抑え、BGMとして邪魔にならないレベル

### Step 4: 音色とミキシング

各チャンネルの音量バランス:

```
Ch1 メロディ (square)  : 0.08  ← 控えめだが聴こえる
Ch2 ベース  (triangle) : 0.12  ← 低音で土台を支える
Ch3 キック  (sine)     : 0.06  ← サブベース的な存在感
Ch3 ハイハット (noise)  : 0.04  ← 空気感を加える程度
```

全体のマスターゲインは `1.0` で、各音の個別ゲインが低いため総合音圧は控えめ。作業用BGMとして長時間聴いても疲れない設計。

### Step 5: エンベロープの微調整

BGM用に専用のエンベロープパラメータを設定:

```
メロディ/ベース:
  アタック: 15ms (SEの8msより長く、柔らかい立ち上がり)
  リリース: 40ms
  ノート長: 実際のステップ長の90%(メロディ) / 85%(ベース) → レガートな隙間

キック:
  周波数: 150Hz → 40Hz (80msで指数的に下降)
  ゲイン: 120msで指数的に減衰

ハイハット:
  ノイズ長: 50ms
  フィルター: 8000Hz ハイパス
  ゲイン: 40msで指数的に減衰
```

---

## 5. サウンドエフェクトの設計

各ユーザーアクションに対応するSEを、操作のフィードバックとして設計:

| アクション | SE名 | 音の構成 | 波形 | 狙い |
|-----------|-------|---------|------|------|
| Todo追加 | `playSfxAdd` | C5→E5→G5 上昇アルペジオ (80ms間隔) | square | 達成感・前進 |
| Todo完了 | `playSfxComplete` | G5→C6 上昇チャイム (120ms間隔) | square | 完了の喜び |
| Todo未完了に戻す | `playSfxUncomplete` | C6→G5 下降2音 (100ms間隔) | triangle | 控えめな巻き戻し感 |
| Todo削除 | `playSfxDelete` | C5→C4 下降スウィープ (8段階, 150ms) | square | 消失・除去 |
| メモ編集開始 | `playSfxToggleMemo` | A4 単音 (50ms) | triangle | 軽いクリック |
| メモ保存 | `playSfxSaveMemo` | E5→G5 (100ms間隔) | triangle | 柔らかい確認 |
| フィルター変更 | `playSfxFilter` | C4/E5/G5 (種類別ピッチ, 40ms) | square | 切替のティック |

**SE設計の原則**:
- 持続時間は40ms〜240msの短さで、操作を妨げない
- 音量は0.1〜0.2の範囲で、BGMと共存できるレベル
- ポジティブなアクション(追加・完了)は上昇音型、ネガティブ(削除)は下降音型
- 完了には矩形波(明るい)、メモ系には三角波(柔らかい)で音色に差異

---

## 6. スケジューリングシステム

### 課題: JavaScriptのタイマー精度

`setTimeout`/`setInterval`はミリ秒単位の精度しかなく、音楽再生には不十分（数十msのズレが発生しうる）。

### 解決: ルックアヘッド・スケジューラ

Web Audio APIの`AudioContext.currentTime`は高精度（サンプルレート精度）なため、これを活用した先読みスケジューリングを実装:

```
setInterval (50ms間隔)
    │
    ▼
scheduler()
    │
    ├─ 現在時刻 + 150ms先読み窓の範囲内にあるステップを検索
    ├─ 該当ステップの全チャンネルのノートをスケジュール
    │   └─ OscillatorNode.start(正確なAudioContext時刻)
    └─ ステップカウンタを進める
```

```typescript
private scheduler = (): void => {
  const ctx = audioEngine.getContext();
  if (!ctx) return;
  while (this.nextStepTime < ctx.currentTime + this.LOOKAHEAD_SEC) {
    this.processStep(this.nextStepTime);
    this.nextStepTime += this.stepDuration;
  }
};
```

**パラメータ**:
- `LOOKAHEAD_SEC = 0.15` (150ms先読み) — タイマーの遅延を吸収
- `SCHEDULER_INTERVAL_MS = 50` (50msごとにチェック) — CPU負荷と精度のバランス

この方式により、JavaScriptのタイマー精度に依存せず、サンプル精度のリズムを実現。

---

## 7. ブラウザ制約への対応

### Autoplay Policy

モダンブラウザはユーザー操作なしの音声再生を禁止する。対応:

```
初期状態: muted=true, initialized=false
    │
    ▼ ユーザーがスピーカーボタンをクリック
    │
    ├─ AudioContext を new で生成
    ├─ context.state === "suspended" なら resume()
    ├─ initialized = true, muted = false に設定
    └─ BGMが自動的に開始
```

`useAudio`フックが初回クリック時に`audioEngine.init()`を呼び出し、ブラウザポリシーを満たした上でAudioContextを初期化する。

### メモリ管理

各オシレーター/バッファソースノードは`onended`コールバックで自動的に`disconnect()`される。BGM停止時は全アクティブノードを即座に停止・クリーンアップ:

```typescript
for (const { source, gain } of this.activeNodes) {
  gain.gain.setValueAtTime(0, now);   // 即座にミュート
  source.stop(now + 0.01);             // 10ms後に停止
}
this.activeNodes = [];
```

---

## 8. 状態管理とUI

### `useAudio` フック

```
localStorage ("todo-memo-app-audio")
    ↕ 同期
[muted, bgmEnabled] 状態
    ↕ 連動
audioEngine.setMuted() / bgmPlayer.start()/stop()
```

- ミュート状態とBGMオン/オフの設定をlocalStorageに永続化
- ページリロード後も前回の設定を復元
- ただし初回は必ず`muted=true`で開始（Autoplay Policy対応）

### `AudioControls` コンポーネント

右下に固定配置(`fixed bottom-4 right-4`)された2つの丸ボタン:

- **音符アイコン**: BGMのオン/オフ切替
- **スピーカーアイコン**: 全サウンドのミュート/ミュート解除

アクティブ時は`--accent-light`背景 + `--accent`色、非アクティブ時は`--card`背景 + `--text-muted`色で、アプリのデザイントークンと統一。

---

## 9. 統合とAPI整合

### エージェント間のAPI不一致と解決

並列で作業した3エージェントのコードには、API設計の不一致があった:

| エージェント | 生成したAPI | 問題 |
|------------|-----------|------|
| audioEngine | `playNote(freq, duration, type, volume, detune)` (位置引数) | — (基準) |
| soundEffects | `playNote({ frequency, type, duration, volume })` (オブジェクト引数) | audioEngineと不一致 |
| soundEffects | `noteToFreq('C5')` (文字列1引数) | `noteToFreq('C', 5)` (2引数)と不一致 |

**解決**: メインエージェントがsoundEffects.tsを書き直し、audioEngineの実際のAPIに合わせた位置引数方式に統一した。

### 最終的な信号フロー

```
[ユーザー操作]
    │
    ├─ Todoを追加 → TodoForm → playSfxAdd() → audioEngine.playNote(C5,E5,G5)
    ├─ Todoを完了 → TodoItem → playSfxComplete() → audioEngine.playNote(G5,C6)
    ├─ Todoを削除 → TodoItem → playSfxDelete() → audioEngine.playNote(C5→C4)
    ├─ メモ編集   → TodoItem → playSfxToggleMemo() → audioEngine.playNote(A4)
    ├─ メモ保存   → TodoItem → playSfxSaveMemo() → audioEngine.playNote(E5,G5)
    └─ フィルター  → TodoFilter → playSfxFilter() → audioEngine.playNote(C4/E5/G5)

[BGM (バックグラウンド)]
    └─ bgmPlayer.scheduler → 50ms毎に先読み → scheduleNote/scheduleKick/scheduleHiHat
```

---

## 10. 成果物サマリー

### ファイル構成

```
src/utils/
├── audioEngine.ts   (139行) — Web Audio API サウンドエンジン
├── soundEffects.ts  ( 84行) — 7種類のSE定義
└── bgm.ts           (331行) — 3チャンネルBGMプレイヤー

src/hooks/
└── useAudio.ts      (100行) — オーディオ状態管理

src/components/
└── AudioControls.tsx (109行) — UI コントロール

合計: 約763行の新規コード (外部依存なし)
```

### BGM仕様

| 項目 | 値 |
|------|-----|
| テンポ | 85 BPM |
| 拍子 | 4/4 |
| キー | C major |
| コード進行 | Cmaj7→Am7→Fmaj7→G7→Em7→Am7→Dm7→G7 |
| ループ長 | 8小節 (約22.6秒) |
| チャンネル数 | 3 (メロディ/ベース/ドラム) |
| 音色 | 矩形波 / 三角波 / ノイズ |
| 外部ファイル | なし (全て Web Audio API で生成) |

### 検証結果

- TypeScriptビルド: 成功 (エラーなし)
- 既存テスト: 54件全合格 (回帰なし)
- ブラウザ動作: Chrome にて BGM再生・SE発音・ミュート/BGM切替を確認
- Vercelデプロイ: 成功
