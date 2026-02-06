import { render, screen } from '@testing-library/react'
import { TodoList } from '@/components/TodoList'
import { createTodo, resetCounter } from '../helpers/todo-factory'

describe('TodoList コンポーネント', () => {
  const defaultHandlers = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onUpdateMemo: vi.fn(),
  }

  beforeEach(() => {
    resetCounter()
    vi.clearAllMocks()
  })

  it('ToDoが空のとき「ToDoがありません」メッセージを表示する', () => {
    render(<TodoList todos={[]} {...defaultHandlers} />)

    expect(screen.getByText('ToDoがありません')).toBeInTheDocument()
  })

  it('ToDoが空のときチェックボックスは表示されない', () => {
    render(<TodoList todos={[]} {...defaultHandlers} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('ToDoが1件のときそのタイトルが表示される', () => {
    const todos = [createTodo({ title: '買い物' })]
    render(<TodoList todos={todos} {...defaultHandlers} />)

    expect(screen.getByText('買い物')).toBeInTheDocument()
    expect(screen.queryByText('ToDoがありません')).not.toBeInTheDocument()
  })

  it('ToDoが3件あるとき3件すべてのタイトルが表示される', () => {
    const todos = [
      createTodo({ title: '買い物' }),
      createTodo({ title: '掃除' }),
      createTodo({ title: '料理' }),
    ]
    render(<TodoList todos={todos} {...defaultHandlers} />)

    expect(screen.getByText('買い物')).toBeInTheDocument()
    expect(screen.getByText('掃除')).toBeInTheDocument()
    expect(screen.getByText('料理')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })

  it('各ToDoのチェックボックスをクリックするとonToggleが呼ばれる', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    const todos = [createTodo({ title: '買い物' })]
    render(<TodoList todos={todos} {...defaultHandlers} />)

    await user.click(screen.getByRole('checkbox'))

    expect(defaultHandlers.onToggle).toHaveBeenCalledWith(todos[0].id)
  })
})
