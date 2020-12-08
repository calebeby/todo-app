import { useEffect, useState } from 'preact/hooks'
import { createPopup } from './app'
import { EditableLabel } from './editable-label'
import { Label } from './label'
import { Popup } from './popup'
import { getAllLabels, makeRequest } from './request'

const newLabel: Omit<Label, 'id'> = {
  color: '#ff0000',
  name: 'New Label',
  is_column: true,
}

const LabelsPopup = () => {
  const [allLabels, setAllLabels] = useState<Label[]>([])

  const refreshLabels = () => getAllLabels().then(setAllLabels)

  useEffect(() => {
    refreshLabels()
  }, [])

  return (
    <Popup>
      <div class="labels-popup">
        <h1>Labels</h1>
        <ul>
          {allLabels.map((label) => (
            <EditableLabel
              key={label.id}
              label={label}
              fireRefresh={refreshLabels}
            />
          ))}
        </ul>
        <button
          onClick={() => {
            makeRequest('/labels', {
              method: 'POST',
              body: JSON.stringify(newLabel),
            }).then((res) => {
              if (res.ok) {
                setAllLabels((labels) => [
                  ...labels,
                  { ...newLabel, id: res.data.id },
                ])
              }
            })
          }}
        >
          +
        </button>
      </div>
    </Popup>
  )
}

export const showLabelsPopup = () => {
  createPopup(<LabelsPopup />)
}
