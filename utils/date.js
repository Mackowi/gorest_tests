const moment = require('moment-timezone')

const createDate = () => {
  // Setting the desired timezone (+5:30) which is Asia/Kolkata
  const timezone = 'Asia/Kolkata'
  // Getting curend date in specific timezone
  const currentDate = moment.tz(timezone)
  // Creating a date in future
  const futureDate = moment(currentDate).add(30, 'minutes')
  // Formatting the date to desired format
  const dueDate = futureDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  return dueDate
}

module.exports = { createDate }
