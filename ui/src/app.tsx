import { WeekView } from './week-view'
import Router, { Route } from 'preact-router'
import { TaskView } from './task-view'

export const App = () => {
  return (
    // @ts-ignore
    <Router>
      <Route path="/" component={WeekView} />
      <Route path="/tasks/:taskId" component={TaskView} />
    </Router>
  )
}
