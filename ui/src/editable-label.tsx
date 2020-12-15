import { mdiPencil } from '@mdi/js'
import { Icon } from './icon'
import { useLabel } from './state'
import { getColorBrightness } from './utilities'
import { createLabelPopup } from './label-popup'

interface Props {
  labelId: number
  additionalIcons?: JSX.Element[] | JSX.Element
}

export const EditableLabel = ({ labelId, additionalIcons }: Props) => {
  const label = useLabel(labelId)

  return (
    <li
      class="label"
      style={
        label && {
          background: label.color,
          color: getColorBrightness(label.color) > 120 ? 'black' : 'white',
        }
      }
    >
      {label?.name}
      <button onClick={() => createLabelPopup(labelId)}>
        <Icon icon={mdiPencil} />
      </button>
      {additionalIcons}
    </li>
  )
}
