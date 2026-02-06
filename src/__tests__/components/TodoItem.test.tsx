import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoItem } from '@/components/TodoItem'
import { Todo } from '@/types/todo'
import { createTodo, resetCounter } from '../helpers/todo-factory'

describe('TodoItem コンポーネント', () => {
  const defaultHandlers = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onUpdateMemo: vi.fn(),
  }

  beforeEach(() => {
    resetCounter()
    vi.clearAllMocks()
  })

  function setup(todoOverrides: Partial<Todo> = {}) {
    const todo = createTodo(todoOverrides)
    const user = userEvent.setup()
    render(<TodoItem todo={todo} {...defaultHandlers} />)
    return { todo, user }
  }

  describe('表示', () => {
    it('ToDoのタイトルが表示される', () => {
      setup({ title: '買い物' })

      expect(screen.getByText('買い物')).toBeInTheDocument()
    })

    it('メモがある場合はメモのテキストが表示される', () => {
      setup({ memo: '牛乳を買う' })

      expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    })

    it('メモが空の場合はメモのテキストが表示されない', () => {
      setup({ title: 'テスト', memo: '' })

      // メモテキストはないが、「メモを追加」ボタンはある
      expect(screen.getByText('メモを追加')).toBeInTheDocument()
    })

    it('未完了のToDoのタイトルに打ち消し線がない', () => {
      setup({ completed: false, title: 'テスト' })

      expect(screen.getByText('テスト')).toHaveStyle({ textDecoration: 'none' })
    })

    it('完了済みのToDoのタイトルに打ち消し線が表示される', () => {
      setup({ completed: true, title: 'テスト' })

      expect(screen.getByText('テスト')).toHaveStyle({ textDecoration: 'line-through' })
    })

    it('完了済みのToDoのタイトルが薄い色で表示される', () => {
      setup({ completed: true, title: 'テスト' })

      expect(screen.getByText('テスト')).toHaveStyle({ color: 'var(--text-muted)' })
    })
  })

  describe('チェックボックス操作', () => {
    it('チェックボックスをクリックするとonToggleがIDで呼ばれる', async () => {
      const { todo, user } = setup()

      await user.click(screen.getByRole('checkbox'))

      expect(defaultHandlers.onToggle).toHaveBeenCalledWith(todo.id)
    })

    it('未完了ToDoのチェックボックスはチェックされていない', () => {
      setup({ completed: false })

      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('完了済みToDoのチェックボックスはチェックされている', () => {
      setup({ completed: true })

      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })

  describe('削除操作', () => {
    it('削除ボタンをクリックするとonDeleteがIDで呼ばれる', async () => {
      const { todo, user } = setup()

      await user.click(screen.getByRole('button', { name: '削除' }))

      expect(defaultHandlers.onDelete).toHaveBeenCalledWith(todo.id)
    })
  })

  describe('メモ編集', () => {
    it('メモがないとき「メモを追加」ボタンが表示される', () => {
      setup({ memo: '' })

      expect(screen.getByText('メモを追加')).toBeInTheDocument()
    })

    it('メモがあるとき「メモを編集」ボタンが表示される', () => {
      setup({ memo: '既存メモ' })

      expect(screen.getByText('メモを編集')).toBeInTheDocument()
    })

    it('「メモを追加」をクリックすると編集モードに入りテキストエリアが表示される', async () => {
      const { user } = setup({ memo: '' })

      await user.click(screen.getByText('メモを追加'))

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByText('保存')).toBeInTheDocument()
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })

    it('編集モードでメモを入力し保存するとonUpdateMemoが呼ばれる', async () => {
      const { todo, user } = setup({ memo: '' })

      await user.click(screen.getByText('メモを追加'))
      await user.type(screen.getByRole('textbox'), '新しいメモ')
      await user.click(screen.getByText('保存'))

      expect(defaultHandlers.onUpdateMemo).toHaveBeenCalledWith(todo.id, '新しいメモ')
    })

    it('既存メモを編集して保存すると更新された値でonUpdateMemoが呼ばれる', async () => {
      const { todo, user } = setup({ memo: '古いメモ' })

      await user.click(screen.getByText('メモを編集'))
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('古いメモ')
      await user.clear(textarea)
      await user.type(textarea, '新しいメモ')
      await user.click(screen.getByText('保存'))

      expect(defaultHandlers.onUpdateMemo).toHaveBeenCalledWith(todo.id, '新しいメモ')
    })

    it('キャンセルするとonUpdateMemoは呼ばれず編集モードが閉じる', async () => {
      const { user } = setup({ memo: '元のメモ' })

      await user.click(screen.getByText('メモを編集'))
      await user.clear(screen.getByRole('textbox'))
      await user.type(screen.getByRole('textbox'), '変更したメモ')
      await user.click(screen.getByText('キャンセル'))

      expect(defaultHandlers.onUpdateMemo).not.toHaveBeenCalled()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('元のメモ')).toBeInTheDocument()
    })

    it('保存後に編集モードが閉じる', async () => {
      const { user } = setup({ memo: '' })

      await user.click(screen.getByText('メモを追加'))
      await user.type(screen.getByRole('textbox'), 'テスト')
      await user.click(screen.getByText('保存'))

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })
})
