//utils/time.js

import dayjs from "dayjs";

export function minutesFromNow(minutes) {
    return dayjs().add(minutes, "minute").toDate();
}

export function daysFromNow(days) {
    return dayjs().add(days, "day").toDate();
}
