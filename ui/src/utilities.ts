const lengthOfDay = 24 * 60 * 60 * 1000

export const getDaysOfMonth = (first: Date) => {
  const startingSundayTime = first.getTime() - first.getDay() * lengthOfDay

  const firstDateOfNextMonth = new Date(first)
  firstDateOfNextMonth.setMonth(firstDateOfNextMonth.getMonth() + 1)

  const lastDateOfMonth = new Date(firstDateOfNextMonth.getTime() - lengthOfDay)

  const lastSaturday = new Date(
    lastDateOfMonth.getTime() + (6 - lastDateOfMonth.getDay()) * lengthOfDay,
  )
  let date = new Date(startingSundayTime)
  const daysOfMonth: Date[] = []
  while (date.getTime() <= lastSaturday.getTime()) {
    daysOfMonth.push(date)

    date = new Date(date.getTime() + lengthOfDay)
  }
  return daysOfMonth
}
