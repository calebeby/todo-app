import { useEffect, useState } from 'preact/hooks'
import { makeRequest, parseDueDate } from './request'
import { Task, TaskWithLabels } from './task'

export const useTaskChanges = (taskListener: TaskListener) => {
  useEffect(() => {
    taskChangeListeners.add(taskListener)
    return () => taskChangeListeners.delete(taskListener)
  }, [taskListener])
}

export const updateTask = async (
  partialTask: Partial<TaskWithLabels>,
  taskId: number,
) => {
  const res = await makeRequest(`/tasks/${taskId}`, {
    body: JSON.stringify(partialTask),
    method: 'PUT',
  })
  const updatedTask = parseDueDate(
    res.data as TaskWithLabels & { due_date: string },
  )
  const oldTask = allTasks.get(taskId)
  if (res.ok) {
    taskChangeListeners.forEach((listener) => listener(oldTask, updatedTask))
    allTasks.set(taskId, updatedTask)
  }
}

export const setTaskLabels = async (taskId: number, labelIds: number[]) => {
  await makeRequest(`/tasks/${taskId}/labels`, {
    method: 'PUT',
    body: JSON.stringify(labelIds),
  })
  const oldTask = allTasks.get(taskId) as TaskWithLabels
  const updatedTask = { ...oldTask, labels: labelIds }
  taskChangeListeners.forEach((listener) => listener(oldTask, updatedTask))
  allTasks.set(taskId, updatedTask)
}

export const createTask = async (task: Omit<Task, 'id'>) => {
  const res = await makeRequest('/tasks', {
    body: JSON.stringify(task),
    method: 'POST',
  })
  const newTask = { labels: [], ...task, id: res.data.id }
  if (res.ok)
    taskChangeListeners.forEach((listener) => listener(undefined, newTask))
  return res.data.id as number
}

export const deleteTask = async (taskId: number) => {
  const res = await makeRequest(`/tasks/${taskId}`, { method: 'DELETE' })
  const oldTask = allTasks.get(taskId) as TaskWithLabels
  if (res.ok)
    taskChangeListeners.forEach((listener) => listener(oldTask, undefined))
}

const allTasks = new Map<number, TaskWithLabels>()

interface Constraints {
  start?: Date
  end?: Date
  is_done?: boolean
}

interface TaskListener {
  (
    oldTask: TaskWithLabels | undefined,
    updatedTask: TaskWithLabels | undefined,
  ): void
}

const taskChangeListeners = new Set<TaskListener>()

const updateTasks = (tasks: TaskWithLabels[]) => {
  tasks.forEach((task) => {
    allTasks.set(task.id, task)
  })
}

const matchesConstraint = (task: TaskWithLabels, constraints: Constraints) =>
  (constraints.start ? task.due_date >= constraints.start : true) &&
  (constraints.end ? task.due_date <= constraints.end : true) &&
  (constraints.is_done !== undefined
    ? task.is_done === constraints.is_done
    : true)

export const useTasks = (constraints: Constraints, deps: unknown[]) => {
  const [tasks, setTasks] = useState<TaskWithLabels[]>([])

  useEffect(() => {
    const params = new URLSearchParams()
    if (constraints.start)
      params.append('start', constraints.start.toUTCString())
    if (constraints.end) params.append('end', constraints.end.toUTCString())
    if (constraints.is_done !== undefined)
      params.append('is_done', String(constraints.is_done))

    makeRequest(`/tasks?${params}`).then((res) => {
      const tasks = res.data as (TaskWithLabels & { due_date: string })[]
      const tasksWithLabels = tasks.map(parseDueDate)
      updateTasks(tasksWithLabels)
      setTasks(tasksWithLabels)
    })
  }, deps)

  useEffect(() => {
    const taskListener: TaskListener = (oldTask, updatedTask) => {
      // represent whether old & new task match constraints
      const oldMatches = oldTask && matchesConstraint(oldTask, constraints)
      const updatedMatches =
        updatedTask && matchesConstraint(updatedTask, constraints)

      if (oldMatches && !updatedMatches) {
        // remove
        setTasks((tasks) => tasks.filter((task) => task.id !== oldTask!.id))
      } else if (!oldMatches && updatedMatches) {
        //add
        setTasks((tasks) => [...tasks, updatedTask!])
      } else if (oldMatches && updatedMatches) {
        //update
        setTasks((tasks) =>
          tasks.map((task) => (task.id === oldTask!.id ? updatedTask! : task)),
        )
      }
    }

    taskChangeListeners.add(taskListener)

    return () => taskChangeListeners.delete(taskListener)
  }, deps)

  return tasks
}

export const useTask = (taskId: number) => {
  const [task, setTask] = useState(allTasks.get(taskId))

  useEffect(() => {
    makeRequest(`/tasks/${taskId}`).then((res) => {
      const task = res.data as TaskWithLabels & { due_date: string }
      const taskWithLabels = parseDueDate(task)
      updateTasks([taskWithLabels])
      setTask(taskWithLabels)
    })
  }, [])

  useEffect(() => {
    const taskListener: TaskListener = (oldTask, updatedTask) => {
      // represent whether old & new task match constraints
      const oldMatches = oldTask && oldTask.id === taskId
      const updatedMatches = updatedTask && updatedTask.id === taskId

      if (oldMatches && !updatedMatches) {
        // remove
        setTask(undefined)
      } else if (updatedMatches) {
        setTask(updatedTask)
      }
    }

    taskChangeListeners.add(taskListener)

    return () => taskChangeListeners.delete(taskListener)
  }, [])

  return task
}
