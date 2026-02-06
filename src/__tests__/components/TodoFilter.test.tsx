import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoFilter } from '@/components/TodoFilter'

describe('TodoFilter コンポーネント', () => {
  it('3つのフィルタボタン「すべて」「未完了」「完了済み」が表示される', () => {
    render(<TodoFilter current="all" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'すべて' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '未完了' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '完了済み' })).toBeInTheDocument()
  })

  it('「すべて」ボタンをクリックするとonChangeが "all" で呼ばれる', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TodoFilter current="active" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'すべて' }))

    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('「未完了」ボタンをクリックするとonChangeが "active" で呼ばれる', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TodoFilter current="all" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '未完了' }))

    expect(onChange).toHaveBeenCalledWith('active')
  })

  it('「完了済み」ボタンをクリックするとonChangeが "completed" で呼ばれる', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TodoFilter current="all" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '完了済み' }))

    expect(onChange).toHaveBeenCalledWith('completed')
  })

  it('現在選択中のフィルタボタンにアクティブスタイルが適用される', () => {
    render(<TodoFilter current="active" onChange={vi.fn()} />)

    const activeButton = screen.getByRole('button', { name: '未完了' })
    expect(activeButton).toHaveStyle({ background: 'var(--accent)', color: '#fff' })
  })

  it('選択されていないボタンにはカード背景の非アクティブスタイルが適用される', () => {
    render(<TodoFilter current="all" onChange={vi.fn()} />)

    const inactiveButton = screen.getByRole('button', { name: '未完了' })
    expect(inactiveButton).toHaveStyle({
      background: 'var(--card)',
      color: 'var(--text-secondary)',
    })
  })
})
