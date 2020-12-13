import { useEffect } from 'preact/hooks'
import { route } from './app'

export const Home = () => {
  // find the view they were last on, or default to week view
  const view = localStorage.getItem('lastView') || '/week'
  route(view, true)
  return <></>
}

type View = '/week' | '/month' | '/list'

export const useSetLastView = (lastView: View) => {
  useEffect(() => {
    localStorage.setItem('lastView', lastView)
  }, [])
}
