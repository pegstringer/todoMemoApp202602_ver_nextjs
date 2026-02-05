"use client";

import { Todo } from "@/types/todo";
import { TodoItem } from "./TodoItem";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => void;
};

export function TodoList({ todos, onToggle, onDelete, onUpdateMemo }: Props) {
  if (todos.length === 0) {
    return (
      <p
        className="py-8 text-center text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        ToDoがありません
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdateMemo={onUpdateMemo}
        />
      ))}
    </div>
  );
}
