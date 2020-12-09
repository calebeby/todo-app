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

/**
 * Returns the brightness of a color
 * https://stackoverflow.com/a/12043228
 */
export const getColorBrightness = (hexColor: string) => {
  const c = hexColor.substring(1) // strip #
  const rgb = parseInt(c, 16) // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff // extract red
  const g = (rgb >> 8) & 0xff // extract green
  const b = (rgb >> 0) & 0xff // extract blue

  return 0.2126 * r + 0.7152 * g + 0.0722 * b // per ITU-R BT.709
}
