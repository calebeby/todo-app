import { useEffect, useState } from 'preact/hooks'
import { updateTask } from './request'
import { Task } from './task'
const lengthOfDay = 24 * 60 * 60 * 1000
const now = new Date()
export const MonthView = () => {
  const [first, setFirst] = useState(
    now.getTime() - lengthOfDay * (now.getDate() - 1),
  )
  //the first day of the month
  const firstDate = new Date(first)

  const lastDateofLastMonth = new Date(firstDate.getTime() - lengthOfDay)
  const startingSunday = first - firstDate.getDay() * lengthOfDay

  const firstDateOfNextMonth = new Date(first)
  firstDateOfNextMonth.setMonth(firstDateOfNextMonth.getMonth() + 1)

  const lastDateOfMonth = new Date(firstDateOfNextMonth.getTime() - lengthOfDay)

  const daysOfMonth = Array<Date>(35)
  for (let i = 0; i < firstDate.getDay(); i++) {
    daysOfMonth[i] = new Date(startingSunday + i * lengthOfDay)
  }
  for (
    let i = firstDate.getDay();
    i < lastDateOfMonth.getDate() + firstDate.getDay();
    i++
  ) {
    daysOfMonth[i] = new Date(first + (i - firstDate.getDay()) * lengthOfDay)
  }
  firstDate.setHours(0, 0, 0, 0)
  lastDateOfMonth.setHours(23, 59, 59, 999)
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => {
    fetch(
      `http://localhost:5000/tasks/?start=${firstDate.toUTCString()}&end=${lastDateOfMonth.toUTCString()}`,
    )
      .then((res) => res.json())
      .then((data: (Task & { due_date: string })[]) => {
        setTasks(
          data.map((task) => ({ ...task, due_date: new Date(task.due_date) })),
        )
      })
  }, [first])

  return (
    <div class="month-view">
      <div class="month-view-header">
        <h1>
          {lastDateOfMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h1>
        <div>
          {
            <button
              onClick={() => {
                setFirst(first - lastDateofLastMonth.getDate() * lengthOfDay)
              }}
            >
              previous
            </button>
          }
          {
            <button
              onClick={() => {
                setFirst(first + lastDateOfMonth.getDate() * lengthOfDay)
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

              {day < firstDate
                ? ' '
                : day.toLocaleDateString('en-US', { day: 'numeric' })
                }
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
