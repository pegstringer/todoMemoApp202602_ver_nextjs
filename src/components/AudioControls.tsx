"use client";

type Props = {
  muted: boolean;
  bgmEnabled: boolean;
  initialized: boolean;
  onToggleMute: () => void;
  onToggleBgm: () => void;
};

export function AudioControls({
  muted,
  bgmEnabled,
  initialized,
  onToggleMute,
  onToggleBgm,
}: Props) {
  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-50">
      {/* BGM Toggle */}
      <button
        onClick={onToggleBgm}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-md"
        style={{
          background: !initialized || muted || !bgmEnabled
            ? "var(--card)"
            : "var(--accent-light)",
          border: "1px solid var(--border)",
          color: !initialized || muted || !bgmEnabled
            ? "var(--text-muted)"
            : "var(--accent)",
        }}
        aria-label={bgmEnabled ? "BGMをオフ" : "BGMをオン"}
        title={bgmEnabled ? "BGM オン" : "BGM オフ"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </button>

      {/* Master Mute Toggle */}
      <button
        onClick={onToggleMute}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-md"
        style={{
          background: !initialized || muted ? "var(--card)" : "var(--accent-light)",
          border: "1px solid var(--border)",
          color: !initialized || muted ? "var(--text-muted)" : "var(--accent)",
        }}
        aria-label={muted ? "サウンドをオン" : "サウンドをオフ"}
        title={
          !initialized
            ? "クリックでサウンドを有効化"
            : muted
              ? "サウンド オフ"
              : "サウンド オン"
        }
      >
        {!initialized || muted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
