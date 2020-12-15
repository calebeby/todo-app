import { useEffect, useState } from 'preact/hooks'
import { Label } from './label'
import { makeRequest, parseDueDate } from './request'
import { Task, TaskWithLabels } from './task'

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
  }, [taskId])

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
  }, [taskId])

  return task
}

interface LabelListener {
  (labelId: number, label: Label | undefined): void
}

const allLabels = new Map<number, Label>()
const labelChangeListeners = new Set<LabelListener>()

export const useLabel = (labelId: number) => {
  const [label, setLabel] = useState(allLabels.get(labelId))

  useEffect(() => {
    makeRequest(`/labels/${labelId}`).then((res) => {
      const label = res.data as Label
      allLabels.set(labelId, label)
      labelChangeListeners.forEach((listener) => listener(labelId, label))
    })
  }, [labelId])

  useEffect(() => {
    const labelListener: LabelListener = (changedLabelId, label) => {
      if (changedLabelId === labelId) setLabel(label)
    }
    labelChangeListeners.add(labelListener)

    return () => labelChangeListeners.delete(labelListener)
  }, [labelId])

  return label
}

export const useAllLabels = () => {
  const [labels, setLabels] = useState<Label[]>([...allLabels.values()])

  useEffect(() => {
    makeRequest(`/labels`).then((res) => {
      const labels = res.data as Label[]
      labels.forEach((label) => {
        allLabels.set(label.id, label)
        labelChangeListeners.forEach((listener) => listener(label.id, label))
      })
    })
  }, [])

  useEffect(() => {
    const labelListener: LabelListener = () => {
      setLabels([...allLabels.values()])
    }
    labelChangeListeners.add(labelListener)

    return () => labelChangeListeners.delete(labelListener)
  }, [])

  return labels
}

export const updateLabel = async (label: Partial<Label>, labelId: number) => {
  const res = await makeRequest(`/labels/${labelId}`, {
    method: 'PUT',
    body: JSON.stringify(label),
  })
  const updatedLabel = res.data as Label
  if (res.ok) {
    allLabels.set(labelId, updatedLabel)
    labelChangeListeners.forEach((listener) => listener(labelId, updatedLabel))
  }
}

export const deleteLabel = async (labelId: number) => {
  const res = await makeRequest(`/labels/${labelId}`, { method: 'DELETE' })
  if (res.ok) {
    allLabels.delete(labelId)
    // notify label listeners that the label doesn't exist anymore
    labelChangeListeners.forEach((listener) => listener(labelId, undefined))

    // also notify task listeners that had the (deleted) label
    allTasks.forEach((oldTask) => {
      const filteredLabelsList = oldTask.labels.filter((l) => l !== labelId)

      // if task didn't have the deleted label, don't update the task
      if (filteredLabelsList.length === oldTask.labels.length) return

      const updatedTask = { ...oldTask, labels: filteredLabelsList }
      allTasks.set(oldTask.id, updatedTask)
      taskChangeListeners.forEach((listener) => listener(oldTask, updatedTask))
    })
    return true
  }
}

export const createLabel = async (newLabel: Omit<Label, 'id'>) => {
  const res = await makeRequest('/labels', {
    method: 'POST',
    body: JSON.stringify(newLabel),
  })
  if (res.ok) {
    const id = res.data.id as number
    const label = { ...newLabel, id }
    allLabels.set(id, label)
    labelChangeListeners.forEach((listener) => listener(id, label))
    return id
  }
}
