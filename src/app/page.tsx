"use client";

import { useTodos } from "@/hooks/useTodos";
import { TodoForm } from "@/components/TodoForm";
import { TodoFilter } from "@/components/TodoFilter";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    deleteTodo,
    toggleTodo,
    updateMemo,
    isLoaded,
  } = useTodos();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1
          className="mb-8 text-center text-2xl font-semibold tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
          ToDo メモ
        </h1>

        <div
          className="mb-8 rounded-2xl p-6 shadow-sm"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <TodoForm onAdd={addTodo} />
        </div>

        <div className="mb-5 flex justify-center">
          <TodoFilter current={filter} onChange={setFilter} />
        </div>

        {!isLoaded ? (
          <p
            className="py-8 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            読み込み中...
          </p>
        ) : (
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdateMemo={updateMemo}
          />
        )}
      </div>
    </div>
  );
}
