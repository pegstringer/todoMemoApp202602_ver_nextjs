"use client";

import { useState } from "react";
import { Todo } from "@/types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete, onUpdateMemo }: Props) {
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState(todo.memo);

  const handleSaveMemo = () => {
    onUpdateMemo(todo.id, memoText);
    setIsEditingMemo(false);
  };

  const handleCancelMemo = () => {
    setMemoText(todo.memo);
    setIsEditingMemo(false);
  };

  return (
    <div
      className="rounded-2xl p-4 transition-colors"
      style={{
        background: todo.completed ? "var(--card-completed)" : "var(--card)",
        border: `1px solid var(--border)`,
      }}
    >
      <div className="flex items-start gap-3">
        <label className="mt-0.5 flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="sr-only"
          />
          <span
            className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors"
            style={{
              borderColor: todo.completed
                ? "var(--accent)"
                : "var(--border)",
              background: todo.completed ? "var(--accent)" : "transparent",
            }}
          >
            {todo.completed && (
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
        </label>

        <div className="flex-1 min-w-0">
          <h3
            className="text-[15px] font-medium leading-relaxed"
            style={{
              color: todo.completed
                ? "var(--text-muted)"
                : "var(--text-primary)",
              textDecoration: todo.completed ? "line-through" : "none",
            }}
          >
            {todo.title}
          </h3>

          {isEditingMemo ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                rows={2}
                className="w-full rounded-lg px-3 py-1.5 text-sm outline-none transition-colors resize-none"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border-focus)",
                  color: "var(--text-primary)",
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMemo}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-white transition-colors"
                  style={{ background: "var(--accent)" }}
                >
                  保存
                </button>
                <button
                  onClick={handleCancelMemo}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    background: "var(--background)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              {todo.memo && (
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{
                    color: todo.completed
                      ? "var(--text-muted)"
                      : "var(--text-secondary)",
                  }}
                >
                  {todo.memo}
                </p>
              )}
              <button
                onClick={() => setIsEditingMemo(true)}
                className="mt-1 text-xs transition-colors"
                style={{ color: "var(--accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--accent)")
                }
              >
                {todo.memo ? "メモを編集" : "メモを追加"}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          className="shrink-0 rounded-lg p-1.5 transition-colors"
          style={{ color: "var(--text-muted)" }}
          aria-label="削除"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger)";
            e.currentTarget.style.background = "var(--danger-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
