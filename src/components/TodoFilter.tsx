"use client";

import { FilterType } from "@/types/todo";

type Props = {
  current: FilterType;
  onChange: (filter: FilterType) => void;
};

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

export function TodoFilter({ current, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className="rounded-xl px-4 py-1.5 text-sm font-medium transition-colors"
          style={
            current === value
              ? { background: "var(--accent)", color: "#fff" }
              : {
                  background: "var(--card)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }
          }
          onMouseEnter={(e) => {
            if (current !== value)
              e.currentTarget.style.background = "var(--accent-light)";
          }}
          onMouseLeave={(e) => {
            if (current !== value)
              e.currentTarget.style.background = "var(--card)";
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
