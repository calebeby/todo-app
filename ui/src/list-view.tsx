import { useSetLastView } from './home'
import { useRequireLogin } from './login'
import { updateTask, useAllLabels, useTasks } from './state'
import { TaskWithLabels } from './task'
import { getColorBrightness } from './utilities'
import { Tabs } from './tabs'
import { createLabelPopup } from './label-popup'
import { mdiPencil } from '@mdi/js'
import { Icon } from './icon'
import { createTaskPopup } from './create-task-popup'

const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)

export const ListView = () => {
  useSetLastView('/list')
  useRequireLogin()

  const columns = useAllLabels().filter((label) => label.is_column)

  const tasks = useTasks({ is_done: false }, [])
  const doneTasksInLastWeek = useTasks({ is_done: true, start: oneWeekAgo }, [])

  return (
    <div class="list-view">
      <div class="list-view-header">
        <Tabs active="/list" />
        <button onClick={() => createTaskPopup({})}>+</button>
      </div>
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
              labelId={column.id}
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
  labelId,
}: {
  tasks: TaskWithLabels[]
  name: string
  color?: string
  labelId?: number
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
        {labelId !== undefined && (
          <button onClick={() => createLabelPopup(labelId)}>
            <Icon icon={mdiPencil} />
          </button>
        )}
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
