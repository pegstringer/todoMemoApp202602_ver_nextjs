"use client";

import { useState } from "react";
import { playSfxAdd } from "@/utils/soundEffects";

type Props = {
  onAdd: (title: string, memo: string) => void;
};

export function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onAdd(trimmedTitle, memo.trim());
    playSfxAdd();
    setTitle("");
    setMemo("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力..."
          className="w-full rounded-xl px-4 py-2.5 text-[15px] outline-none transition-colors"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-focus)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        />
      </div>
      <div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモ（任意）"
          rows={2}
          className="w-full rounded-xl px-4 py-2.5 text-[15px] outline-none transition-colors resize-none"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-focus)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl px-4 py-2.5 text-[15px] font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "var(--accent)" }}
        disabled={!title.trim()}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled)
            e.currentTarget.style.background = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--accent)";
        }}
      >
        追加
      </button>
    </form>
  );
}
