export interface Task {
  id: number
  title: string
  description: string
  due_date: Date
  is_done: boolean
}

export interface TaskWithLabels extends Task {
  labels: number[]
}
