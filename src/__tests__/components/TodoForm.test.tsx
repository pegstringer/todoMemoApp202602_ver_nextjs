import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoForm } from '@/components/TodoForm'

describe('TodoForm コンポーネント', () => {
  function setup() {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoForm onAdd={onAdd} />)
    const titleInput = screen.getByPlaceholderText('タイトルを入力...')
    const memoInput = screen.getByPlaceholderText('メモ（任意）')
    const submitButton = screen.getByRole('button', { name: '追加' })
    return { onAdd, user, titleInput, memoInput, submitButton }
  }

  it('初期状態で追加ボタンが無効になっている', () => {
    const { submitButton } = setup()

    expect(submitButton).toBeDisabled()
  })

  it('タイトルを入力すると追加ボタンが有効になる', async () => {
    const { user, titleInput, submitButton } = setup()

    await user.type(titleInput, '買い物')

    expect(submitButton).not.toBeDisabled()
  })

  it('空白だけのタイトルでは追加ボタンが無効のまま', async () => {
    const { user, titleInput, submitButton } = setup()

    await user.type(titleInput, '   ')

    expect(submitButton).toBeDisabled()
  })

  it('タイトルを入力して送信するとonAddがトリミングされた値で呼ばれる', async () => {
    const { onAdd, user, titleInput, memoInput, submitButton } = setup()

    await user.type(titleInput, '  買い物  ')
    await user.type(memoInput, '  牛乳を買う  ')
    await user.click(submitButton)

    expect(onAdd).toHaveBeenCalledWith('買い物', '牛乳を買う')
  })

  it('送信後にタイトルとメモの入力欄がクリアされる', async () => {
    const { user, titleInput, memoInput, submitButton } = setup()

    await user.type(titleInput, '買い物')
    await user.type(memoInput, '牛乳を買う')
    await user.click(submitButton)

    expect(titleInput).toHaveValue('')
    expect(memoInput).toHaveValue('')
  })

  it('メモなしでも送信できる', async () => {
    const { onAdd, user, titleInput, submitButton } = setup()

    await user.type(titleInput, 'テスト')
    await user.click(submitButton)

    expect(onAdd).toHaveBeenCalledWith('テスト', '')
  })

  it('タイトルが空の状態でフォーム送信してもonAddは呼ばれない', async () => {
    const { onAdd, user, titleInput } = setup()

    await user.type(titleInput, '{Enter}')

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('Enterキーでフォームを送信できる', async () => {
    const { onAdd, user, titleInput } = setup()

    await user.type(titleInput, 'テスト{Enter}')

    expect(onAdd).toHaveBeenCalledWith('テスト', '')
  })
})
