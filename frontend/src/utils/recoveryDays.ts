// Starting 9/10, BC is only reporting data Tues, Thurs, Sat. These adjustments
// are needed to keep the 7-day change accurate.
const getRecoveryDays = (date: Date, recoveryDays: number): number => {
  if (date > new Date(2020, 8, 17)) {
    return Math.floor(recoveryDays / 2);
  } else if (date > new Date(2020, 8, 15)) {
    return 4;
  } else if (date > new Date(2020, 8, 12)) {
    return 6;
  }

  return recoveryDays;
};

export default getRecoveryDays;
