const R = require('ramda-extended')
const fsp = require('fs-promise')
const paths = require('./paths')
const chalk = require('chalk')
const Promise = require('bluebird')

const U = require('./metal')

function isInstalled() {
  return fsp.lstat(paths.etConfig())
    .then(R.always(true))
    .catch(R.always(false))
}


function isNotInstalled() {
  return isInstalled().then(R.not)
}


/**
 * The function only gets called if et is installed
 * @param {function} fn
 * @return {function} fn
 */
function mustBeInstalled(fn) {
  return function wrapped() {
    return isInstalled()
      .then(installed => {
        if (!installed) {
          console.log(chalk.red('Env Tracker has not been installed yet.'))
          console.log('')
          console.log('To install Env Tracker, run `et install`')
          console.log('')
        } else {
          return R.apply(fn, arguments)
        }
      })
  }
}


/**
 * Adds the current project context
 * @param fn
 * @return {wrapped}
 */
function mustBeInProject(fn) {
  return function wrapped() {
    return Promise.resolve()
  }

}
/**
 * The function only gets called if et is not installed
 * @param {function} fn
 * @return {function} fn
 */
function mustNotBeInstalled(fn) {
  return function wrapped () {
    return isInstalled()
      .then(installed => {
        if (installed) {
          console.log('')
          console.log(chalk.red('Env Tracker has already been installed!'))
          console.log('')
        } else {
          return R.apply(fn, arguments)
        }
      })
  }

}

/**
 *
 * @param {Object} module
 * @param {function} module.setup
 * @param {function} module.command
 * @return {function}
 */
function delegate(module) {
  if (!module.setup) throw new Error('Module must have a "parser" function')
  if (!module.command) throw new Error('Module must have a "command" function')
  return function actor () {
    return Promise.resolve()
      .then(() => R.apply(module.setup, arguments))
      .then(module.command)
  }
}

module.exports = {
  delegate: delegate,
  isInstalled: isInstalled,
  isNotInstalled: isNotInstalled,
  mustBeInstalled: mustBeInstalled,
  mustNotBeInstalled: mustNotBeInstalled,
}
