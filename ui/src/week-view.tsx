import { h, Fragment } from "preact";

const lengthOfDay = 24 * 60 * 60 * 1000;

export const WeekView = () => {
  const now = new Date("Nov 19 2020");
  const sunday = now.getTime() - now.getDay() * lengthOfDay;
  const daysOfWeek = Array<Date>(7);
  for (let i = 0; i < 7; i++) {
    daysOfWeek[i] = new Date(sunday + i * lengthOfDay);
  }
  return (
    <>
      <h1>Week View</h1>
      <div class="week">
        {daysOfWeek.map((day) => {
          return (
            <div class="weekday">
              <div>{day.toLocaleDateString("en-US", { weekday: "long" })}</div>
              <div>{day.toLocaleDateString("en-US", { day: "numeric" })}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};
