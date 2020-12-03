import { useEffect, useRef } from 'preact/hooks'
import { closePopup } from './app'

interface Props {
  close?: () => void
  children: JSX.Element | JSX.Element[]
}

export const Popup = ({ close = closePopup, children }: Props) => {
  // Make pressing <esc> close it
  useEffect(() => {
    const keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    addEventListener('keydown', keyboardHandler)
    return () => removeEventListener('keydown', keyboardHandler)
  }, [])

  const popupEl = useRef<HTMLDivElement>()
  return (
    <div
      ref={popupEl}
      class="popup-background"
      onClick={(e) => {
        // Makes sure that the click isn't clicking on the _contents_ of the popup
        // It should only close the popup if the click is on the dimmed background
        if (e.target === popupEl.current) close()
      }}
    >
      {children}
    </div>
  )
}
