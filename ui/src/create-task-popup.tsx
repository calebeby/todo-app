import { useEffect, useRef } from 'preact/hooks'
import { closePopup, createPopup, route } from './app'
import { createTask } from './request'
import { Popup } from './popup'
import { Task } from './task'

export const createTaskPopup = (task: Partial<Task>) => {
  createPopup(<CreateTaskPopup task={task} />)
}

const CreateTaskPopup = ({ task }: { task: Partial<Task> }) => {
  const inputRef = useRef<HTMLInputElement>()
  useEffect(() => {
    inputRef.current.focus()
  }, [])
  return (
    <Popup>
      <form
        class="create-task-popup"
        onSubmit={async (e) => {
          e.preventDefault()

          const newTask = {
            description: '',
            due_date: new Date(),
            is_done: false,
            ...task,
            title: inputRef.current.value,
          }
          const id = await createTask(newTask)
          closePopup()
          route(`/tasks/${id}`)
        }}
      >
        <input ref={inputRef} type="text" placeholder="Create a task" />
        <button>Create</button>
      </form>
    </Popup>
  )
}
