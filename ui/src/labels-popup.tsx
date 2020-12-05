import { useEffect, useState } from 'preact/hooks'
import { createPopup } from './app'
import { Label } from './label'
import { Popup } from './popup'
import { getAllLabels } from './request'

const LabelsPopup = () => {
  const [allLabels, setAllLabels] = useState<Label[]>([])

  useEffect(() => {
    getAllLabels().then(setAllLabels)
  }, [])

  return (
    <Popup>
      <div class="labels-popup">
        <h1>Labels</h1>
        <ul>
          {allLabels.map((label) => (
            <li style={{ background: label.color }}>{label.name}</li>
          ))}
        </ul>
      </div>
    </Popup>
  )
}

export const showLabelsPopup = () => {
  createPopup(<LabelsPopup />)
}
