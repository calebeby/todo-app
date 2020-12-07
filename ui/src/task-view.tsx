import { useCallback, useEffect, useState } from 'preact/hooks'
import { route } from './app'
import { getAllLabels, makeRequest, updateTask } from './request'
import { useTaskChanges } from './state'
import { Task } from './task'
import { Popup } from './popup'
import { showLabelsPopup } from './labels-popup'
import { Label } from './label'
import { EditableLabel } from './editable-label'

export const TaskView = ({ taskId }: { taskId: string }) => {
  const [task, setTask] = useState<Task | null>(null)
  const [labels, setLabels] = useState<Label[]>([])
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [isEditingTitle, setEditingTitle] = useState(false)
  const [isEditingLabels, setEditingLabels] = useState(false)
  const [labelSearch, setLabelSearch] = useState<string>('')
  const refreshLabels = () => getAllLabels().then(setAllLabels)
  useEffect(() => {
    getAllLabels().then(setAllLabels)
  }, [])
  useEffect(() => {
    makeRequest(`/tasks/${taskId}`).then((response) => {
      const task = response.data as Task & { due_date: string }
      setTask({ ...task, due_date: new Date(task.due_date) })
    })
    makeRequest(`/tasks/${taskId}/labels`).then((response) => {
      const labels = response.data as Label[]
      setLabels(labels)
    })
  }, [taskId])

  useTaskChanges(
    useCallback(
      (task) => {
        if (task.id === Number(taskId)) setTask(task)
      },
      [taskId],
    ),
  )

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

  const close = () => route('/')

  return (
    <Popup close={close}>
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
              onBlur={() => {
                setEditingTitle(false)
              }}
            />
          ) : (
            <h1
              onClick={() => {
                setEditingTitle(true)
              }}
            >
              {task?.title}
            </h1>
          )}
          <button onClick={close}>Close</button>
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
          <div class="box-of-labels">
            {labels.map((label) => {
              return <EditableLabel label={label} fireRefresh={refreshLabels} />
            })}
            <button
              onClick={() => {
                setEditingLabels(!isEditingLabels)
              }}
            >
              +
            </button>
            <div class="adding-labels">
              {isEditingLabels ? (
                <>
                  <button class="edit-labels-button" onClick={showLabelsPopup}>
                    Edit Labels
                  </button>
                  <input
                    type="text"
                    placeholder="search for labels"
                    onInput={(e) => {
                      setLabelSearch(e.currentTarget.value)
                    }}
                  />
                  {allLabels.map((label) => {
                    return label.name.startsWith(labelSearch) ? (
                      <button style={{ background: label.color }}>
                        {label.name}
                      </button>
                    ) : (
                      ' '
                    )
                  })}
                </>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  )
}
