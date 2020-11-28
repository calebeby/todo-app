import { useEffect, useState } from 'preact/hooks'
import { Task } from './task'

export const TaskView = ({ taskId }: { taskId: number }) => {
  const [task, setTask] = useState<Task | null>(null)
  useEffect(() => {
    fetch(`http://localhost:5000/tasks/${taskId}`)
      .then((res) => res.json())
      .then((task: Task & { due_date: string }) => {
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

  return (
    <div class="task-view">
      <div class="task-popup">
        <h1>
          <input
            type="checkbox"
            checked={task?.is_done}
            onChange={(e) => {
              const checked = e.currentTarget.checked
              fetch(`http://localhost:5000/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_done: checked }),
              }).then((res) => res.json())
            }}
          />
          {task?.title}
        </h1>
        <input type="datetime-local" value={dueDate} />
        <p>{task?.description}</p>
      </div>
    </div>
  )
}