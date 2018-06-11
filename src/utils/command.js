const R = require('ramda-extended')
const Promise = require('bluebird')
const configuration = require('./configuration')
const E = require('./errors')

/**
 *
 * @param {Object} module
 * @param {function} module.command
 * @param {function} [module.setup]
 * @param {function[]} module.preconditions
 * @return {function}
 */
function ETCommand(module) {
  if (!module.setup) throw new Error('Module must have a "parser" function')
  if (!module.command) throw new Error('Module must have a "command" function')
  if (!module.preconditions) throw new Error('Module must specify preconditions')

  function actor () {
    return Promise.resolve()
      .then(() => new configuration.AppContext())
      .then(R.pipeP(module.preconditions))
      .then(pretext => {
        if (module.setup) {
          // Always apply the et configuration as the first argument to setup
          return R.pipe(
            R.map(R.identity),
            R.concat([pretext]),
            R.apply(module.setup)
          )(arguments)
        } else {
          return pretext
        }
      })
      .then(module.command)
      .catch(E.displayError)
  }
  return actor
}

module.exports = ETCommand