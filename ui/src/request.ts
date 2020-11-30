import { Task } from "./task"

export const updateTask = (partialTask: Partial<Task>, taskId: number | string) => {
    return fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialTask),
    }).then((res) => res.json())
  }