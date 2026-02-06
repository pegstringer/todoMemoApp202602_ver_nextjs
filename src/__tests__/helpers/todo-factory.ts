import { Todo } from '@/types/todo'

let counter = 0

export function createTodo(overrides: Partial<Todo> = {}): Todo {
  counter++
  return {
    id: `test-id-${counter}`,
    title: `テストToDo ${counter}`,
    memo: '',
    completed: false,
    createdAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  }
}

export function resetCounter() {
  counter = 0
}
