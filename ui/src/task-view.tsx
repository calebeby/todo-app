import { useEffect, useRef, useState } from 'preact/hooks'
import { closePopup } from './app'
import {
  createLabel,
  deleteTask,
  setTaskLabels,
  updateTask,
  useAllLabels,
  useTask,
} from './state'
import { Popup } from './popup'
import { EditableLabel } from './editable-label'
import { Icon } from './icon'
import { mdiClose, mdiPlus } from '@mdi/js'
import { isDescendent, randomColor } from './utilities'
import { useRequireLogin } from './login'
import { createLabelPopup } from './label-popup'

export const TaskView = ({ taskId: taskIdString }: { taskId: string }) => {
  useRequireLogin()

  const taskId = Number(taskIdString)
  const task = useTask(taskId)
  const [isEditingTitle, setEditingTitle] = useState(false)
  const [isEditingLabels, setEditingLabels] = useState(false)

  const dueDate =
    task?.due_date &&
    task.due_date.getFullYear() +
      '-' +
      String(task.due_date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(task.due_date.getDate()).padStart(2, '0') +
      'T' +
      String(task.due_date.getHours()).padStart(2, '0') +
      ':' +
      String(task.due_date.getMinutes()).padStart(2, '0')

  return (
    <Popup>
      <div class="task-popup">
        <header>
          <input
            type="checkbox"
            checked={task?.is_done}
            onChange={(e) => {
              const checked = e.currentTarget.checked
              updateTask({ is_done: checked }, taskId)
            }}
          />
          {isEditingTitle ? (
            <input
              autofocus
              type="text"
              value={task?.title}
              onChange={(e) => {
                const value = e.currentTarget.value
                updateTask({ title: value }, taskId)
              }}
              onBlur={() => setEditingTitle(false)}
            />
          ) : (
            <h1 onClick={() => setEditingTitle(true)}>{task?.title}</h1>
          )}
          <button onClick={closePopup} class="task-close-button">
            <Icon icon={mdiClose} />
          </button>
        </header>
        <div class="task-body">
          <div class="task-attributes">
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => {
                const value = e.currentTarget.value
                updateTask({ due_date: new Date(value) }, taskId)
              }}
            />
            <textarea
              onChange={(e) => {
                const value = e.currentTarget.value
                updateTask({ description: value }, taskId)
              }}
            >
              {task?.description}
            </textarea>
          </div>
          <div class="task-right-column">
            <div class="box-of-labels">
              <h2>
                Labels
                <button onClick={() => setEditingLabels(!isEditingLabels)}>
                  +
                </button>
              </h2>
              <ul>
                {task?.labels.map((labelId) => {
                  return (
                    <EditableLabel
                      key={labelId}
                      labelId={labelId}
                      additionalIcons={
                        <button
                          onClick={() => {
                            const updatedLabels = task.labels.filter(
                              (lId) => lId !== labelId,
                            )
                            setTaskLabels(taskId, updatedLabels)
                          }}
                        >
                          <Icon icon={mdiClose} />
                        </button>
                      }
                    />
                  )
                })}
              </ul>
              {isEditingLabels && (
                <TaskLabelsEditor
                  close={() => setEditingLabels(false)}
                  taskId={taskId}
                />
              )}
            </div>
            <button
              class="delete-task"
              onClick={() => deleteTask(taskId).then(closePopup)}
            >
              Delete task
            </button>
          </div>
        </div>
      </div>
    </Popup>
  )
}

const TaskLabelsEditor = ({
  close,
  taskId,
}: {
  close: () => void
  taskId: number
}) => {
  const [labelSearch, setLabelSearch] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>()
  const popupRef = useRef<HTMLDivElement>()

  const allLabels = useAllLabels()
  const task = useTask(taskId)

  useEffect(() => {
    // focus input when first rendered
    inputRef.current.focus()
  }, [])

  useEffect(() => {
    const clickListener = (e: MouseEvent) => {
      const clickIsWithinPopup = isDescendent(
        e.target as HTMLElement,
        popupRef.current,
      )
      if (!clickIsWithinPopup) close()
    }
    addEventListener('click', clickListener)
    return () => removeEventListener('click', clickListener)
  }, [])

  useEffect(() => {
    const keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        e.stopPropagation()
      }
    }
    addEventListener('keydown', keyboardHandler, { capture: true })
    return () =>
      removeEventListener('keydown', keyboardHandler, { capture: true })
  }, [])

  return (
    <div class="adding-labels" ref={popupRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for labels"
        onInput={(e) => {
          setLabelSearch(e.currentTarget.value.toLowerCase())
        }}
      />
      <ul>
        {allLabels
          .filter((label) => label.name.toLowerCase().includes(labelSearch))
          .map((label) => {
            const hasLabel = task?.labels.includes(label.id)
            return (
              <EditableLabel
                key={label.id}
                labelId={label.id}
                additionalIcons={
                  task && (
                    <button
                      onClick={() =>
                        setTaskLabels(
                          taskId,
                          hasLabel
                            ? task.labels.filter((l) => l !== label.id)
                            : [...task.labels, label.id],
                        )
                      }
                    >
                      <Icon icon={hasLabel ? mdiClose : mdiPlus} />
                    </button>
                  )
                }
              />
            )
          })}
      </ul>
      <button
        onClick={async () => {
          const id = await createLabel({
            color: randomColor(),
            name: 'New Label',
            is_column: true,
          })
          if (id === undefined) return
          createLabelPopup(id)
          if (task) setTaskLabels(taskId, [...task.labels, id])
        }}
      >
        +
      </button>
    </div>
  )
}
