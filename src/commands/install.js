const fsp = require('fs-promise')
const exec = require('mz/child_process').exec
const Promise = require('bluebird')

const paths = require('../utils/paths')
const config = require('../utils/configuration')


function ensureGitInstalled () {
  // TODO: remove this - it's unnecessary
  return exec('which git')
    .catch(() => Promise.reject(new Error('git must be installed')))
}


function initWorkingDir () {
  return fsp.ensureDir(paths.etRoot())
}


function initConfigFile () {
  return config.read()
    .catch(() => config.write({}))
}


module.exports = function install () {
  return Promise.resolve()
    .then(ensureGitInstalled)
    .then(initWorkingDir)
    .then(initConfigFile)
    .then(() => {
      console.log('')
      console.log('Env Tracker has been installed.')
      console.log('')
      console.log('Your project files can be found in in ~/.et')
      console.log('')
      console.log('To start tracking a project, run the command:')
      console.log('')
      console.log('    et init path/to/your/project')
      console.log('')
    })
}
