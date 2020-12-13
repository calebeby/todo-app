import { useLayoutEffect, useState } from 'preact/hooks'
import { parse, match, exec } from 'matchit'
import { Home } from './home'

interface Route {
  path: string
  component: () => Promise<(props: any) => JSX.Element>
  /** Whether the route should display on top of other routes */
  stack?: boolean
}

/** List of all the URL's in the application and which components to load for each one */
const routes: Route[] = [
  {
    path: '/',
    component: () => Promise.resolve(Home),
  },
  {
    path: '/week',
    component: () => import('./week-view').then((m) => m.WeekView),
  },
  {
    path: '/month',
    component: () => import('./month-view').then((m) => m.MonthView),
  },
  {
    path: '/list',
    component: () => import('./list-view').then((m) => m.ListView),
  },
  {
    path: '/login',
    component: () => import('./login').then((m) => m.Login),
  },
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

interface StackItem {
  element: JSX.Element
  url?: string
}

export const App = () => {
  const [stack, setStack] = useState<StackItem[]>(componentStack)

  // Subscribes to changes to the component stack
  // useLayoutEffect is used instead of useEffect because otherwise the subscription is added too late and the home redirect doesn't work.
  useLayoutEffect(() => {
    componentStackListeners.add(setStack)
    return () => componentStackListeners.delete(setStack)
  }, [])

  return <>{stack.map((s) => s.element)}</>
}

/**
 * Holds the components currently being rendered.
 * It is a stack so that multiple components can be displayed, for example for popups
 */
let componentStack: StackItem[] = []
const componentStackListeners = new Set<
  (stack: typeof componentStack) => void
>()
const setComponentStack = (newStack: typeof componentStack) => {
  componentStack = newStack
  componentStackListeners.forEach((listener) => listener(componentStack))
}

/** Adds a popup to the component stack */
export const createPopup = (popup: JSX.Element) => {
  setComponentStack([...componentStack, { element: popup }])
}

/** Removes the component on the end of the component stack (meant for hiding popups) */
export const closePopup = () => {
  const topOfStack = componentStack[componentStack.length - 1]
  if (topOfStack.url !== undefined) {
    // if the popup has a url, then go back so the url changes to the previous page
    // This will fire the popstate listener which will handle removing the component
    history.back()
  } else {
    setComponentStack(componentStack.slice(0, -1))
  }
}

/**
 * Figures out which component to display, based on the URL,
 * and loads that component and puts it in the component stack
 */
const handleUrlChange = () => {
  const url = location.pathname
  const urlWithoutQuery = url.split('?')[0]
  const matched = match(urlWithoutQuery, parsedRoutes)
  if (matched.length === 0)
    return setComponentStack([{ element: <h1>404</h1> }])
  const props = exec(urlWithoutQuery, matched)
  const route = routes[parsedRoutes.indexOf(matched)]
  route.component().then((Component) => {
    // skip update if URL has changed while component was being loaded
    if (url !== location.pathname) return
    const stackItem: StackItem = { url, element: <Component {...props} /> }
    // If the route has the stack attribute, add it on top of previous components
    // Otherwise, un-render previous components
    setComponentStack(
      route.stack ? [...componentStack, stackItem] : [stackItem],
    )
  })
}

// Chack the URL right away to render the first component
handleUrlChange()

/** Client-side redirect */
export const route = (newPartialUrl: string, replace = false) => {
  history[replace ? 'replaceState' : 'pushState'](null, '', newPartialUrl)
  handleUrlChange()
}

// Whenever the URL changes from the browser back/forwards button, handle the changed URL
addEventListener('popstate', () => handleUrlChange())

// when any link is clicked, intercept and update state
addEventListener('click', (e: MouseEvent) => {
  // ignore if other keys are pressed
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0) return
  const target = (e.target as Element).closest('a')
  if (!target) return
  const href = target.getAttribute('href')
  if (!href) return
  // if it is an internal link, prevent browser defaults
  if (href.startsWith('/')) {
    route(href)
    e.preventDefault()
    e.stopImmediatePropagation()
    e.stopPropagation()
    return false
  }
})
