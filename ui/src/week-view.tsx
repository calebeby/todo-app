import { useEffect, useState } from 'preact/hooks'
const lengthOfDay = 24 * 60 * 60 * 1000

interface Task {
  id: number
  title: string
  description: string
  dueDate: Date
  isDone: boolean
}
export const WeekView = () => {
  const now = new Date()
  const sunday = now.getTime() - now.getDay() * lengthOfDay
  const daysOfWeek = Array<Date>(7)
  for (let i = 0; i < 7; i++) {
    daysOfWeek[i] = new Date(sunday + i * lengthOfDay)
  }
  const startDate = daysOfWeek[0]
  const endDate = daysOfWeek[daysOfWeek.length - 1]
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => {
    fetch(
      `https://cors-anywhere.herokuapp.com/https://api.mocki.io/v1/0ca72e4f`,
    )
      .then((res) => res.json())
      .then((data: (Task & { dueDate: string })[]) => {
        setTasks(
          data.map((task) => ({ ...task, dueDate: new Date(task.dueDate) })),
        )
      })
  }, [])

  // TODO: switch weeks
  // TODO: toggle isDone from checkbox

  return (
    <>
      <h1>Week View</h1>
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
                      task.dueDate.getDate() === day.getDate() &&
                      task.dueDate.getMonth() === day.getMonth() &&
                      task.dueDate.getFullYear() === day.getFullYear()
                    )
                  })
                  .map((task) => {
                    return (
                      <>
                        <li class="weekday-task">
                          <input
                            type="checkbox"
                            checked={task.isDone}
                            disabled
                          ></input>
                          <span>{task.title}</span>
                          <span>
                            {task.dueDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              dayPeriod: 'short',
                            })}
                          </span>
                        </li>
                        <li class="weekday-task">
                          <input
                            type="checkbox"
                            checked={task.isDone}
                            disabled
                          ></input>
                          <span>{task.title}</span>
                          <span>
                            {task.dueDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              dayPeriod: 'short',
                            })}
                          </span>
                        </li>
                      </>
                    )
                  })}
              </ol>
            </div>
          )
        })}
      </div>
    </>
  )
}
