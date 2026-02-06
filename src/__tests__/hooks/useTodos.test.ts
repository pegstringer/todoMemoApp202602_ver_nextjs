import { renderHook, act } from '@testing-library/react'
import { useTodos } from '@/hooks/useTodos'
import { Todo } from '@/types/todo'

// localStorage モック
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

const STORAGE_KEY = 'todo-memo-app'

describe('useTodos カスタムフック', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('mocked-uuid-1' as `${string}-${string}-${string}-${string}-${string}`)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-06T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  function seedTodos(todos: Todo[]) {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(todos))
  }

  const sampleTodos: Todo[] = [
    { id: '1', title: 'ToDo 1', memo: 'メモ1', completed: false, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: '2', title: 'ToDo 2', memo: '', completed: true, createdAt: '2026-01-02T00:00:00.000Z' },
    { id: '3', title: 'ToDo 3', memo: 'メモ3', completed: false, createdAt: '2026-01-03T00:00:00.000Z' },
  ]

  describe('初期化とlocalStorageの読み込み', () => {
    it('初回マウント時にlocalStorageからToDoを読み込む', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      expect(result.current.todos).toHaveLength(3)
      expect(result.current.todos[0].title).toBe('ToDo 1')
    })

    it('localStorageが空の場合は空配列で初期化される', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.todos).toHaveLength(0)
    })

    it('localStorageに不正なJSONが入っている場合は空配列にフォールバックする', () => {
      localStorageMock.getItem.mockReturnValueOnce('{{invalid json')
      const { result } = renderHook(() => useTodos())

      expect(result.current.todos).toHaveLength(0)
    })

    it('isLoadedがマウント後にtrueになる', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.isLoaded).toBe(true)
    })
  })

  describe('localStorageへの保存', () => {
    it('ToDoを追加するとlocalStorageに保存される', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo('テスト', 'メモ')
      })

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].title).toBe('テスト')
    })
  })

  describe('addTodo - ToDo追加', () => {
    it('タイトルとメモを指定して新しいToDoを先頭に追加する', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo('買い物', '牛乳を買う')
      })

      const todo = result.current.todos[0]
      expect(todo.title).toBe('買い物')
      expect(todo.memo).toBe('牛乳を買う')
      expect(todo.completed).toBe(false)
      expect(todo.id).toBe('mocked-uuid-1')
      expect(todo.createdAt).toBe('2026-02-06T12:00:00.000Z')
    })

    it('複数のToDoを追加すると新しいものが常に先頭になる', () => {
      vi.spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('uuid-1' as `${string}-${string}-${string}-${string}-${string}`)
        .mockReturnValueOnce('uuid-2' as `${string}-${string}-${string}-${string}-${string}`)

      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo('最初のToDo', '')
      })
      act(() => {
        result.current.addTodo('2番目のToDo', '')
      })

      expect(result.current.todos[0].title).toBe('2番目のToDo')
      expect(result.current.todos[1].title).toBe('最初のToDo')
    })

    it('メモが空文字でも正常に追加される', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo('テスト', '')
      })

      expect(result.current.todos[0].memo).toBe('')
    })
  })

  describe('deleteTodo - ToDo削除', () => {
    it('指定したIDのToDoが削除される', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.deleteTodo('2')
      })

      expect(result.current.todos).toHaveLength(2)
      expect(result.current.todos.find(t => t.id === '2')).toBeUndefined()
    })

    it('存在しないIDを指定しても他のToDoに影響しない', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.deleteTodo('non-existent-id')
      })

      expect(result.current.todos).toHaveLength(3)
    })
  })

  describe('toggleTodo - 完了状態の切り替え', () => {
    it('未完了のToDoを完了にする', () => {
      seedTodos([sampleTodos[0]]) // completed: false
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.toggleTodo('1')
      })

      expect(result.current.todos[0].completed).toBe(true)
    })

    it('完了済みのToDoを未完了に戻す', () => {
      seedTodos([sampleTodos[1]]) // completed: true
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.toggleTodo('2')
      })

      expect(result.current.todos[0].completed).toBe(false)
    })

    it('指定したIDのToDoだけが切り替わり他は影響を受けない', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.toggleTodo('1')
      })

      expect(result.current.todos.find(t => t.id === '1')!.completed).toBe(true)
      expect(result.current.todos.find(t => t.id === '2')!.completed).toBe(true)  // 元からtrue
      expect(result.current.todos.find(t => t.id === '3')!.completed).toBe(false) // 変更なし
    })
  })

  describe('updateMemo - メモ更新', () => {
    it('指定したIDのToDoのメモを更新する', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.updateMemo('1', '新しいメモ')
      })

      expect(result.current.todos.find(t => t.id === '1')!.memo).toBe('新しいメモ')
    })

    it('メモを空文字に更新できる', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.updateMemo('1', '')
      })

      expect(result.current.todos.find(t => t.id === '1')!.memo).toBe('')
    })
  })

  describe('フィルタリング', () => {
    it('フィルタ "all" はすべてのToDoを返す', () => {
      seedTodos(sampleTodos) // 2 active, 1 completed
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.setFilter('all')
      })

      expect(result.current.todos).toHaveLength(3)
    })

    it('フィルタ "active" は未完了のToDoだけを返す', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.setFilter('active')
      })

      expect(result.current.todos).toHaveLength(2)
      expect(result.current.todos.every(t => !t.completed)).toBe(true)
    })

    it('フィルタ "completed" は完了済みのToDoだけを返す', () => {
      seedTodos(sampleTodos)
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.setFilter('completed')
      })

      expect(result.current.todos).toHaveLength(1)
      expect(result.current.todos[0].completed).toBe(true)
    })
  })
})
