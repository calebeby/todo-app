import { useEffect, useState } from 'preact/hooks'
import { route } from './app'
import { makeRequest, updateTask } from './request'
import { Task } from './task'

export const TaskView = ({ taskId }: { taskId: string }) => {
  const [task, setTask] = useState<Task | null>(null)
  const [isEditingTitle, setEditingTitle] = useState(false)
  useEffect(() => {
    makeRequest(`/tasks/${taskId}`).then((response) => {
      const task = response.data as Task & { due_date: string }
      setTask({ ...task, due_date: new Date(task.due_date) })
    })
  }, [taskId])

  const dueDate =
    task?.due_date &&
    task.due_date.getFullYear() +
      '-' +
      String(task.due_date.getMonth() + 1).padStart(2, '0') +
      '-' +
      task.due_date.getDate() +
      'T' +
      String(task.due_date.getHours()).padStart(2, '0') +
      ':' +
      String(task.due_date.getSeconds()).padStart(2, '0')

  const close = () => route('/')

  return (
    <div
      class="task-view"
      onClick={(event) => {
        const clickedOnThisElement = (event.target as HTMLElement).classList.contains(
          'task-view',
        )
        if (clickedOnThisElement) close()
      }}
    >
      <div class="task-popup">
        <header>
          <input
            type="checkbox"
            checked={task?.is_done}
            onChange={(e) => {
              const checked = e.currentTarget.checked
              updateTask({ is_done: checked }, taskId)
            }}
          />
          {isEditingTitle ? (
            <input
              autofocus
              type="text"
              value={task?.title}
              onChange={(e) => {
                const value = e.currentTarget.value
                updateTask({ title: value }, taskId)
              }}
              onBlur={() => {
                setEditingTitle(false)
              }}
            />
          ) : (
            <h1
              onClick={() => {
                setEditingTitle(true)
              }}
            >
              {task?.title}
            </h1>
          )}
          <button onClick={close}>Close</button>
        </header>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => {
            const value = e.currentTarget.value
            updateTask({ due_date: new Date(value) }, taskId)
          }}
        />
        <textarea
          onChange={(e) => {
            const value = e.currentTarget.value
            updateTask({ description: value }, taskId)
          }}
        >
          {task?.description}
        </textarea>
      </div>
    </div>
  )
}
