import { useState, useEffect } from 'preact/hooks'
import { Label } from './label'
import { makeRequest, parseDueDate, updateTask } from './request'
import { Task } from './task'
import { getColorBrightness } from './utilities'

type Column = Label & { is_column: true }
type TaskWithLabels = Task & { labels: number[] }

export const ListView = () => {
  const [tasks, setTasks] = useState<TaskWithLabels[]>([])
  const [doneTasksInLastWeek, setDoneTasksInLastWeek] = useState<
    TaskWithLabels[]
  >([])

  useEffect(() => {
    makeRequest('/tasks?is_done=false').then((res) => {
      const tasks = res.data as (Task & {
        due_date: string
        labels: number[]
      })[]
      setTasks(tasks.map(parseDueDate))
    })
  }, [])

  useEffect(() => {
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
    makeRequest(`/tasks?is_done=true&start=${oneWeekAgo.toUTCString()}`).then(
      (res) => {
        const tasks = res.data as (Task & {
          due_date: string
          labels: number[]
        })[]
        setDoneTasksInLastWeek(tasks.map(parseDueDate))
      },
    )
  }, [])

  const [columns, setColumns] = useState<Column[]>([])

  useEffect(() => {
    makeRequest('/column_labels').then((res) => {
      if (!res.ok) return
      const columns = res.data
      setColumns(columns)
    })
  }, [])

  return (
    <div class="list-view">
      <h1>List View</h1>
      <div class="list-view-lists">
        <Column
          key="unlabeled"
          tasks={tasks.filter((task) => task.labels.length === 0)}
          name="Unlabeled"
        />
        {columns.map((column) => {
          return (
            <Column
              key={column.id}
              tasks={tasks.filter((task) => task.labels.includes(column.id))}
              name={column.name}
              color={column.color}
            />
          )
        })}
        <Column key="done" tasks={doneTasksInLastWeek} name="Done" />
      </div>
    </div>
  )
}

const Column = ({
  tasks,
  name,
  color,
}: {
  tasks: TaskWithLabels[]
  name: string
  color?: string
}) => {
  return (
    <div class="list-view-list">
      <h2
        style={{
          background: color,
          color: color && (getColorBrightness(color) > 120 ? 'black' : 'white'),
        }}
      >
        {name}
      </h2>
      <ul>
        {tasks
          // @ts-ignore
          .sort((a, b) => a.due_date - b.due_date)
          .map((task) => {
            return (
              <li class="weekday-task" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.is_done}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    updateTask({ is_done: checked }, task.id)
                  }}
                />
                <a href={`/tasks/${task.id}`}>
                  <span>{task.title}</span>
                  <span>
                    {task.due_date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      dayPeriod: 'short',
                    })}
                  </span>
                </a>
              </li>
            )
          })}
      </ul>
    </div>
  )
}
