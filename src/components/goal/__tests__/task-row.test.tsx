import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskRow } from '../task-row'
import type { TaskRecord } from '@/lib/goal-data'

const baseTask: TaskRecord = {
  id: 'task-1',
  title: 'Write Q1 report',
  status: 'todo',
  assignee_name: 'Alice',
  due_date: '2026-03-31',
}

describe('TaskRow', () => {
  it('renders the task title', () => {
    render(<TaskRow task={baseTask} />)
    expect(screen.getByText('Write Q1 report')).toBeInTheDocument()
  })

  it('renders the status label', () => {
    render(<TaskRow task={baseTask} />)
    expect(screen.getByText('To do')).toBeInTheDocument()
  })

  it('renders the assignee name', () => {
    render(<TaskRow task={baseTask} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders formatted due date', () => {
    render(<TaskRow task={baseTask} />)
    // Mar 31 formatted in en-US
    expect(screen.getByText('Mar 31')).toBeInTheDocument()
  })

  it('applies line-through style when done', () => {
    render(<TaskRow task={{ ...baseTask, status: 'done' }} />)
    const title = screen.getByText('Write Q1 report')
    expect(title.className).toContain('line-through')
  })

  it('does not apply line-through when not done', () => {
    render(<TaskRow task={baseTask} />)
    const title = screen.getByText('Write Q1 report')
    expect(title.className).not.toContain('line-through')
  })

  it('renders "In progress" label for in_progress status', () => {
    render(<TaskRow task={{ ...baseTask, status: 'in_progress' }} />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('renders "Blocked" label for blocked status', () => {
    render(<TaskRow task={{ ...baseTask, status: 'blocked' }} />)
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('renders "Done" label for done status', () => {
    render(<TaskRow task={{ ...baseTask, status: 'done' }} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders "Cancelled" label for cancelled status', () => {
    render(<TaskRow task={{ ...baseTask, status: 'cancelled' }} />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('does not render assignee section when both are null', () => {
    render(<TaskRow task={{ ...baseTask, assignee_name: null, due_date: null }} />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })
})
