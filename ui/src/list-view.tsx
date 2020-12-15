import { useSetLastView } from './home'
import { useRequireLogin } from './login'
import { updateTask, useAllLabels, useTasks, setTaskLabels } from './state'
import { TaskWithLabels } from './task'
import { getColorBrightness } from './utilities'
import { Tabs } from './tabs'
import { createLabelPopup } from './label-popup'
import { mdiPencil } from '@mdi/js'
import { Icon } from './icon'
import { createTaskPopup } from './create-task-popup'

//What about the tasks with labels that are not columns? they need to go into the unlabeled category.
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
          id="unlabeled"
          tasks={tasks.filter((task) =>
            task.labels.every((label) =>
              columns.every((col) => col.id !== label),
            ),
          )}
          name="Unlabeled"
        />
        {columns.map((column) => {
          return (
            <Column
              key={column.id}
              id={column.id}
              tasks={tasks.filter((task) => task.labels.includes(column.id))}
              name={column.name}
              color={column.color}
            />
          )
        })}
        <Column id="done" tasks={doneTasksInLastWeek} name="Done" />
      </div>
    </div>
  )
}

const Column = ({
  id,
  tasks,
  name,
  color,
}: {
  id: 'unlabeled' | 'done' | number
  tasks: TaskWithLabels[]
  name: string
  color?: string
}) => {
  return (
    <div
      class="list-view-list"
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        if (e.dataTransfer === null) return
        const stringdraggedTask = e.dataTransfer.getData('TaskWithLabels')
        const oldColId = e.dataTransfer.getData('oldColId')

        const draggedTask: TaskWithLabels = JSON.parse(stringdraggedTask)
        e.preventDefault()
        //dropping into the done column
        if (id === 'done') updateTask({ is_done: true }, draggedTask.id)
        //if leaving the done column and not moving to the unlabled column
        //This is needed in order to make sure is_done is unchecked again
        else if (id !== 'unlabeled' && oldColId === 'done') {
          updateTask({ is_done: false }, draggedTask.id)
          setTaskLabels(draggedTask.id, [...draggedTask.labels, id])
        }
        //dropping a task from either unlabled to normal column or normal column to normal column.
        else if (id !== 'unlabeled' && oldColId !== 'done') {
          //remove old label
          let updatedLabels = draggedTask.labels.filter(
            //Do we want the old label to be removed or no??
            (labelId) => String(labelId) !== oldColId,
          )
          //add new label
          setTaskLabels(draggedTask.id, [...updatedLabels, id])
        } else if (id === 'unlabeled') {
          setTaskLabels(draggedTask.id, [])
        }
      }}
    >
      <h2
        style={{
          background: color,
          color: color && (getColorBrightness(color) > 120 ? 'black' : 'white'),
        }}
      >
        {name}
        {typeof id === 'number' && (
          <button onClick={() => createLabelPopup(id)}>
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
              <li
                class="weekday-task"
                key={task.id}
                draggable
                onDragStart={(e) => {
                  if (e.dataTransfer !== null) {
                    e.dataTransfer.setData(
                      'TaskWithLabels',
                      JSON.stringify(task),
                    )
                    e.dataTransfer.setData('oldColId', String(id))
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={task.is_done}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    updateTask({ is_done: checked }, task.id)
                  }}
                />
                <a href={`/tasks/${task.id}`} draggable={false}>
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
