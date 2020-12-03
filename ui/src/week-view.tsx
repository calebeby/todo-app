import { useCallback, useEffect, useState } from 'preact/hooks'
import { makeRequest, parseDueDate, updateTask } from './request'
import { useTaskChanges } from './state'
import { createTaskPopup } from './create-task-popup'
import { Task } from './task'
const lengthOfDay = 24 * 60 * 60 * 1000
const lengthOfWeek = 7 * lengthOfDay

const today = new Date()
// reset it to start of day
today.setHours(0, 0, 0, 0)

export const WeekView = () => {
  const [sunday, setSunday] = useState(
    today.getTime() - today.getDay() * lengthOfDay,
  )
  const daysOfWeek = Array<Date>(7)
  for (let i = 0; i < 7; i++) {
    daysOfWeek[i] = new Date(sunday + i * lengthOfDay)
  }
  const startDate = daysOfWeek[0]
  // makes a copy of the date object to not modify the time of the original
  const endDate = new Date(daysOfWeek[daysOfWeek.length - 1])
  // Sets to end of day to include tasks happening during the last day of the week
  endDate.setHours(23, 59, 59, 999)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    makeRequest(
      `/tasks/?start=${startDate.toUTCString()}&end=${endDate.toUTCString()}`,
    ).then((res) => {
      const tasks = res.data as (Task & { due_date: string })[]
      setTasks(tasks.map(parseDueDate))
    })
  }, [sunday])

  useTaskChanges(
    useCallback((updatedTask) => {
      setTasks((oldTasks) => {
        let hasBeenFound = false
        return oldTasks
          .map((t) => {
            if (t.id === updatedTask.id) {
              hasBeenFound = true
              return updatedTask
            }
            return t
          })
          .concat(hasBeenFound ? [] : [updatedTask])
      })
    }, []),
  )

  return (
    <div class="week-view">
      <div class="weekview-header">
        <h1>Week View</h1>
        <h1>
          {daysOfWeek[0].getMonth() === daysOfWeek[6].getMonth()
            ? daysOfWeek[0].toLocaleDateString('en-US', { month: 'long' })
            : `${daysOfWeek[0].toLocaleDateString('en-US', {
                month: 'long',
              })}-${daysOfWeek[6].toLocaleDateString('en-US', {
                month: 'long',
              })}`}
        </h1>
        <div>
          <button
            onClick={() => {
              setSunday(sunday - lengthOfWeek)
            }}
          >
            previous
          </button>
          <button
            onClick={() => {
              setSunday(sunday + lengthOfWeek)
            }}
          >
            next
          </button>
        </div>
      </div>
      <div class="week">
        {daysOfWeek.map((day) => {
          return (
            <div class="weekday">
              <div class="weekday-header">
                <div>
                  {day.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div>{day.toLocaleDateString('en-US', { day: 'numeric' })}</div>
              </div>
              <ol class="weekday-task-list">
                {tasks
                  .filter((task) => {
                    return (
                      task.due_date.getDate() === day.getDate() &&
                      task.due_date.getMonth() === day.getMonth() &&
                      task.due_date.getFullYear() === day.getFullYear()
                    )
                  })
                  .sort(
                    (a, b) =>
                      // @ts-ignore
                      a.due_date - b.due_date,
                  )
                  .map((task) => {
                    return (
                      <li class="weekday-task">
                        <input
                          type="checkbox"
                          checked={task?.is_done}
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
              </ol>
              <button
                class="weekview-create-task"
                onClick={() => createTaskPopup({ due_date: day })}
              >
                +
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
