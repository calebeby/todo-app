import { useEffect, useState } from 'preact/hooks'
import { updateTask } from './request'
import { Task } from './task'
const lengthOfDay = 24 * 60 * 60 * 1000
const lengthOfWeek = 7 * lengthOfDay

const now = new Date()
export const WeekView = () => {
  const [sunday, setSunday] = useState(
    now.getTime() - now.getDay() * lengthOfDay,
  )
  const daysOfWeek = Array<Date>(7)
  for (let i = 0; i < 7; i++) {
    daysOfWeek[i] = new Date(sunday + i * lengthOfDay)
  }
  const startDate = daysOfWeek[0]
  const endDate = daysOfWeek[daysOfWeek.length - 1]
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => {
    fetch(
      `http://localhost:5000/tasks/?start=${startDate.toUTCString()}&end=${endDate.toUTCString()}`,
    )
      .then((res) => res.json())
      .then((data: (Task & { due_date: string })[]) => {
        setTasks(
          data.map((task) => ({ ...task, due_date: new Date(task.due_date) })),
        )
      })
  }, [sunday])

  // TODO: toggle is_done from checkbox

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
            </div>
          )
        })}
      </div>
    </div>
  )
}

declare global {
  namespace Intl {
    interface DateTimeFormatOptions {
      dayPeriod?: string
    }
  }
}
