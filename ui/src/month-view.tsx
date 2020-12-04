import { useCallback, useEffect, useState } from 'preact/hooks'
import { createTaskPopup } from './create-task-popup'
import { makeRequest, parseDueDate, updateTask } from './request'
import { useTaskChanges } from './state'
import { Task } from './task'
import { getDaysOfMonth } from './utilities'
const lengthOfDay = 24 * 60 * 60 * 1000
const now = new Date()

//todo: clean up, syncing function, make tasks smaller
export const MonthView = () => {
  const [first, setFirst] = useState(
    now.getTime() - lengthOfDay * (now.getDate() - 1),
  )
  const daysOfMonth = getDaysOfMonth(new Date(first))

  daysOfMonth[0].setHours(0, 0, 0, 0)
  daysOfMonth[daysOfMonth.length - 1].setHours(23, 59, 59, 999)
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => {
    makeRequest(
      `/tasks/?start=${daysOfMonth[0].toUTCString()}&end=${daysOfMonth[
        daysOfMonth.length - 1
      ].toUTCString()}`,
    ).then((res) => {
      const tasks = res.data as (Task & { due_date: string })[]
      setTasks(tasks.map(parseDueDate))
    })
  }, [first])

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
    <div class="month-view">
      <div class="month-view-header">
        <h1>
          {new Date(first).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h1>
        <div>
          {
            <button
              onClick={() => {
                const firstOfMonth = new Date(first)
                setFirst(firstOfMonth.setMonth(firstOfMonth.getMonth() - 1))
              }}
            >
              previous
            </button>
          }
          {
            <button
              onClick={() => {
                const firstOfMonth = new Date(first)
                setFirst(firstOfMonth.setMonth(firstOfMonth.getMonth() + 1))
              }}
            >
              next
            </button>
          }
        </div>
      </div>
      <div class="monthday-header">
        <div>Sunday</div>
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
        <div>Saturday</div>
      </div>
      <div class="month">
        {daysOfMonth.map((day) => {
          return (
            <div class="monthday">
              <div>
                {day.toLocaleDateString('en-US', { day: 'numeric' })}
                <button
                  class="monthday-create-task"
                  onClick={() => createTaskPopup({ due_date: day })}
                >
                  +
                </button>
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
                        </a>
                      </li>
                    )
                  })}
              </ol>
            </div>
          )
        })}
      </div>
    </div>
  )
}
