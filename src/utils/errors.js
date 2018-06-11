const R = require('ramda-extended')
const chalk = require('chalk')

function criticalReject (displayFn) {
  return Promise.reject(criticalError(displayFn))
}

function criticalError (displayFn) {
  if (arguments.length === 0) {
    displayFn = function () {
      console.log('')
      console.log(chalk.red('An unknown error occurred.'))
      console.log('')
    }
  } else if (R.is(String, displayFn)) {
    const msg = displayFn
    displayFn = function () {
      console.log('')
      console.log(chalk.red(msg))
      console.log('')

    }
  }
  const err = new Error()
  err.displayFn = displayFn
  return err
}

/**
 * To be used in a catch block
 * @param err
 */
function displayError (err) {
  console.log(err.stack)
  if (err.displayFn) {
    err.displayFn()
  } else {
    console.log('')
    console.log(chalk.red(err.toString()))
    console.log('')
  }
}

module.exports = {
  criticalReject: criticalReject,
  criticalError: criticalError,
  displayError: displayError,
}
