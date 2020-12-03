import { useEffect, useState } from 'preact/hooks'
import { parse, match, exec } from 'matchit'

interface Route {
  path: string
  component: () => Promise<(props: any) => JSX.Element>
  /** Whether the route should display on top of other routes */
  stack?: boolean
}

/** List of all the URL's in the application and which components to load for each one */
const routes: Route[] = [
  { path: '/', component: () => import('./week-view').then((m) => m.WeekView) },
  { path: '/monthview', component: () => import('./month-view').then((m) => m.MonthView) },
  { path: '/login', component: () => import('./login').then((m) => m.Login) },
  {
    path: '/signup',
    component: () => import('./signup').then((m) => m.Signup),
  },
  {
    path: '/tasks/:taskId',
    component: () => import('./task-view').then((m) => m.TaskView),
    stack: true,
  },
]

const parsedRoutes = routes.map((route) => parse(route.path))

export const App = () => {
  const [componentStack, setComponentStack] = useState<JSX.Element[]>([])

  const getComponent = () => {
    const url = location.pathname
    const urlWithoutQuery = url.split('?')[0]
    const matched = match(urlWithoutQuery, parsedRoutes)
    if (matched.length === 0) return setComponentStack([<h1>404</h1>])
    const props = exec(urlWithoutQuery, matched)
    const route = routes[parsedRoutes.indexOf(matched)]
    route.component().then((Component) => {
      setComponentStack((prevStack) => {
        // skip update if URL has changed while component was being loaded
        if (url !== location.pathname) return prevStack
        const newRouteComponent = <Component {...props} />
        if (route.stack) return [...prevStack, newRouteComponent]
        return [newRouteComponent]
      })
    })
  }

  useEffect(() => {
    // Subscribe to URL changes
    urlListener = () => {
      getComponent()
    }
  }, [])

  useEffect(() => {
    // On initial render load the component based on the URL
    getComponent()
  }, [])

  return componentStack
}

// Once the App component is mounted, gets replaced with a real listener
let urlListener = () => {}

export const route = (newPartialUrl: string, replace = false) => {
  history[replace ? 'replaceState' : 'pushState'](null, '', newPartialUrl)
  urlListener()
}

// when any link is clicked, intercept and update state
addEventListener('click', (e: MouseEvent) => {
  // ignore if other keys are pressed
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0) return
  const target = (e.target as Element).closest('a')
  if (!target) return
  const href = target.getAttribute('href')
  if (!href) return
  const hrefWithoutQuery = href.split('?')[0]
  const matched = match(hrefWithoutQuery, parsedRoutes)
  // if link is handled by the router, prevent browser defaults
  if (matched.length !== 0) {
    route(href)
    e.preventDefault()
    e.stopImmediatePropagation()
    e.stopPropagation()
    return false
  }
})

// Whenever the URL changes from the browser back/forwards button, handle the changed URL
addEventListener('popstate', () => urlListener())
