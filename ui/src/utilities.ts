const lengthOfDay = 24 * 60 * 60 * 1000
const now = new Date()

export const getDaysOfMonth=(first:Date) =>{

    const lastDateofLastMonth = new Date(first.getTime() - lengthOfDay)
    const startingSundayTime = first.getTime() - first.getDay() * lengthOfDay
    
    const firstDateOfNextMonth = new Date(first)
    firstDateOfNextMonth.setMonth(firstDateOfNextMonth.getMonth() + 1)
    
    const lastDateOfMonth = new Date(firstDateOfNextMonth.getTime() - lengthOfDay)
    
    const lastSaturday = new Date(
      lastDateOfMonth.getTime() + (6 - lastDateOfMonth.getDay()) * lengthOfDay,
    )
    const startingSunday = new Date(startingSundayTime)
    let date = new Date(startingSundayTime)
    const daysOfMonth:Date[] = []
    console.log(new Date(startingSundayTime), lastSaturday)
    while (date.getTime() <= lastSaturday.getTime()) {
      daysOfMonth.push(date)
    
      date = new Date(date.getTime() + lengthOfDay)
    }
    return daysOfMonth
}