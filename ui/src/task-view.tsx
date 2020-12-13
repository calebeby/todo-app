import { useEffect, useState } from 'preact/hooks'
import { closePopup } from './app'
import { getAllLabels } from './request'
import { setTaskLabels, updateTask, useTask } from './state'
import { Popup } from './popup'
import { showLabelsPopup } from './labels-popup'
import { Label } from './label'
import { EditableLabel } from './editable-label'
import { Icon } from './icon'
import { mdiClose } from '@mdi/js'
import { getColorBrightness } from './utilities'

export const TaskView = ({ taskId: taskIdString }: { taskId: string }) => {
  const taskId = Number(taskIdString)
  const task = useTask(taskId)
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [isEditingTitle, setEditingTitle] = useState(false)
  const [isEditingLabels, setEditingLabels] = useState(false)
  const [labelSearch, setLabelSearch] = useState<string>('')
  const refreshLabels = () => getAllLabels().then(setAllLabels)

  useEffect(() => {
    refreshLabels()
  }, [])

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
          <button onClick={closePopup}>Close</button>
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
            {task?.labels.map((labelId) => {
              const label = allLabels.find((l) => l.id === labelId)
              if (!label) return
              return (
                <EditableLabel
                  label={label}
                  fireRefresh={refreshLabels}
                  key={label.id}
                  additionalIcons={
                    <button
                      onClick={() => {
                        let updatedLabels = task.labels.filter(
                          (labelId) => labelId !== label.id,
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
            <button onClick={() => setEditingLabels(!isEditingLabels)}>
              +
            </button>
            <div class="adding-labels">
              {isEditingLabels && (
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
                  {allLabels
                    .filter(
                      (label) =>
                        label.name.includes(labelSearch) &&
                        task?.labels.every((l) => l !== label.id),
                    )
                    .map((label) => (
                      <button
                        style={{
                          background: label.color,
                          color:
                            getColorBrightness(label.color) > 120
                              ? 'black'
                              : 'white',
                        }}
                        key={label.id}
                        onClick={() => {
                          let updatedLabels = [
                            ...(task?.labels || []),
                            label.id,
                          ]
                          setTaskLabels(taskId, updatedLabels)
                        }}
                      >
                        {label.name}
                      </button>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  )
}
