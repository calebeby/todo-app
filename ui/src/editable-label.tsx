import { mdiCheck, mdiPencil, mdiTrashCan } from '@mdi/js'
import { useEffect, useRef, useState } from 'preact/hooks'
import { Label } from './label'
import { makeRequest } from './request'
import { Icon } from './icon'
import { getColorBrightness, useUnmountEffect } from './utilities'
export const EditableLabel = ({
  label: originalLabel,
  fireRefresh,
  additionalIcons,
}: {
  label: Label
  fireRefresh: () => void
  additionalIcons?: JSX.Element | JSX.Element[]
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(originalLabel)
  const upload = () => {
    makeRequest(`/labels/${label.id}`, {
      method: 'PUT',
      body: JSON.stringify(label),
    })
  }
  const nameInputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (isEditing) nameInputRef.current.focus()
  }, [isEditing])

  useUnmountEffect(() => {
    if (isEditing) upload()
  })

  const stopEditing = () => {
    setIsEditing(false)
    upload()
  }

  return (
    <li
      class="editable-label"
      style={{
        background: label.color,
        color: getColorBrightness(label.color) > 120 ? 'black' : 'white',
      }}
    >
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            stopEditing()
          }}
        >
          <input
            type="text"
            ref={nameInputRef}
            value={label.name}
            onChange={(e) => {
              setLabel((l) => ({ ...l, name: e.currentTarget.value }))
            }}
          />
        </form>
      ) : (
        label.name
      )}
      {isEditing ? (
        <button onClick={stopEditing}>
          <Icon icon={mdiCheck} />
        </button>
      ) : (
        <button onClick={() => setIsEditing(true)}>
          <Icon icon={mdiPencil} />
        </button>
      )}
      {!isEditing && additionalIcons}
      {isEditing && (
        <div>
          <input
            type="color"
            value={label.color}
            onInput={(e) =>
              setLabel((l) => ({ ...l, color: e.currentTarget.value }))
            }
          />
          <label>
            Display as column
            <input
              type="checkbox"
              checked={label.is_column}
              onChange={(e) =>
                setLabel((l) => ({ ...l, is_column: e.currentTarget.checked }))
              }
            />
          </label>
          <button
            onClick={() =>
              makeRequest(`/labels/${label.id}`, { method: 'DELETE' }).then(
                fireRefresh,
              )
            }
          >
            Delete
            <Icon icon={mdiTrashCan} />
          </button>
        </div>
      )}
    </li>
  )
}
