import { mdiCheck, mdiPencil, mdiTrashCan } from "@mdi/js"
import { useState } from "preact/hooks"
import { Label } from "./label"
import { makeRequest } from "./request"
import { Icon } from "./icon"
export const EditableLabel = ({
    label: originalLabel,
    fireRefresh,
  }: {
    label: Label
    fireRefresh: () => void
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [label, setLabel] = useState(originalLabel)
    const upload = () => {
      makeRequest(`/labels/${label.id}`, {
        method: 'PUT',
        body: JSON.stringify(label),
      })
    }
    return (
      <li class = "editable-label"
        style={{
          background: label.color,
          color: getColorBrightness(label.color) > 120 ? 'black' : 'white',
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={label.name}
            onChange={(e) => {
              setLabel((l) => ({ ...l, name: e.currentTarget.value }))
            }}
          />
        ) : (
          label.name
        )}
        <button
          onClick={() =>
            setIsEditing((wasEditing) => {
              if (wasEditing) upload()
              return !wasEditing
            })
          }
        >
          <Icon icon={isEditing ? mdiCheck : mdiPencil} />
        </button>
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
  
  /**
   * Returns the brightness of a color
   * https://stackoverflow.com/a/12043228
   */
  const getColorBrightness = (hexColor: string) => {
    const c = hexColor.substring(1) // strip #
    const rgb = parseInt(c, 16) // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff // extract red
    const g = (rgb >> 8) & 0xff // extract green
    const b = (rgb >> 0) & 0xff // extract blue
  
    return 0.2126 * r + 0.7152 * g + 0.0722 * b // per ITU-R BT.709
  }