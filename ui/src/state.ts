import { useEffect } from 'preact/hooks'
import { Task } from './task'

interface TaskListener {
  (updatedTask: Task): void
}

export const useTaskChanges = (taskListener: TaskListener) => {
  useEffect(() => {
    taskChangeListeners.add(taskListener)
    return () => taskChangeListeners.delete(taskListener)
  }, [taskListener])
}

const taskChangeListeners = new Set<TaskListener>()

export const fireTaskChange = (task: Task) => {
  taskChangeListeners.forEach((listener) => listener(task))
}
