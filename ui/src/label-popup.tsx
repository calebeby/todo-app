import { Popup } from './popup'
import { useRequireLogin } from './login'
import { mdiTrashCan } from '@mdi/js'
import { deleteLabel, updateLabel, useLabel } from './state'
import { Icon } from './icon'
import { useRef, useEffect } from 'preact/hooks'
import { closePopup, createPopup } from './app'

interface Props {
  labelId: number
}

export const createLabelPopup = (labelId: number) =>
  createPopup(<LabelPopup labelId={labelId} />)

const LabelPopup = ({ labelId }: Props) => {
  useRequireLogin()

  const label = useLabel(labelId)
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    inputRef.current.select()
  }, [])

  return (
    <Popup>
      <form
        class="label-popup"
        onSubmit={(e) => {
          e.preventDefault()
          closePopup()
        }}
      >
        <div>
          <input
            ref={inputRef}
            type="text"
            value={label?.name}
            onChange={(e) => {
              updateLabel({ name: e.currentTarget.value }, labelId)
            }}
          />
          <label
            class="color-picker"
            style={{
              // @ts-ignore
              '--color': label?.color,
            }}
          >
            <input
              type="color"
              value={label?.color}
              onChange={(e) =>
                updateLabel({ color: e.currentTarget.value }, labelId)
              }
            />
          </label>
        </div>
        <label>
          Display as column
          <input
            type="checkbox"
            checked={label?.is_column}
            onChange={(e) =>
              updateLabel({ is_column: e.currentTarget.checked }, labelId)
            }
          />
        </label>
        <button
          type="button"
          onClick={() =>
            deleteLabel(labelId).then((success) => {
              if (success) closePopup()
            })
          }
        >
          Delete
          <Icon icon={mdiTrashCan} />
        </button>
      </form>
    </Popup>
  )
}
