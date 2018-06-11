'use strict'

const R = require('ramda-extended')
const fsp = require('fs-promise')
const path = require('path')
const chalk = require('chalk')
const Promise = require('bluebird')
const git = require('nodegit')

const E = require('../utils/errors')
const U = require('../utils/metal')
const paths = require('../utils/paths')
const config = require('../utils/configuration')
const display = require('../utils/display')
const Command = require('../utils/command')
const preconditions = require('../utils/preconditions')

/**
 * @param {Object} options
 * @param {Application} options.app
 * @param {String} [options.destination]
 * @param {String} [options.projectPath]
 * @constructor
 */
class InitContext {
  constructor (options) {
    this.projectPath = options.projectPath
    this.destination = options.destination
    this.app = options.app
  }
  get etProjectPath () {
    return paths.etProjectPath(this.destination || path.basename(this.projectPath))
  }
  get projectConfig () {
    return new config.Project({
      etPath: this.etProjectPath,
      projectPath: this.projectPath
    })
  }
}

function initSetup (app, options) {
  return Object.freeze(new InitContext({
    app: app,
    projectPath: process.cwd(),
    destination: options.destination
  }))
}


/**
 *
 * @param {InitContext} ctx
 * @return {Promise}
 */
function preventDuplicateProjects (ctx) {
  // TODO: check the configuration to make sure we don't have a project pointing to the projectPath
  // - otherwise we get an indeterminate state when
  return paths.pathExists(ctx.etProjectPath)
    .then(exists => {
      if (exists) {
        return E.criticalReject(function () {
          console.log('')
          console.log(chalk.red(`A project with that destination already exists: "${ctx.destination}"`))
          console.log('')
          console.log(`"${ctx.destination}" currently manages the project at ${chalk.underline(ctx.projectConfig.projectPath)}`)
          console.log('')
          console.log('')
          console.log(`    et init ${ctx.etProjectPath} -n someOtherName`)
          console.log('')
        })
      }
    })
    .then(R.always(ctx))
}


/**
 * @param {InitContext} ctx
 * @return {Promise}
 */
function initProjectDir (ctx) {
  return fsp.ensureDir(ctx.etProjectPath)
    .then(() => git.Repository.init(ctx.etProjectPath, 0))
    .then(R.always(ctx))
}

/**
 * @param {InitContext} ctx
 * @return {Promise}
 */
function registerProjectConfig (ctx) {
  return config.writeProject(ctx.projectConfig)
    .then(R.always(ctx))
}

function preventNestedProjects (ctx) {
  console.log('NOT IMPLEMENTED: preventNestedProjects')
  return ctx
}

/**
 * @param {InitContext} ctx
 * @return {Promise}
 */
function initCommand (ctx) {
  return Promise.resolve(ctx)
    .tap(preventDuplicateProjects)
    .tap(preventNestedProjects)
    .tap(initProjectDir)
    .tap(registerProjectConfig)
    .tap(ctx => {
      console.log('')
      console.log('A git repository has been created to keep track of your ignored project files.')
      console.log('')
      display.projectConfig(ctx.projectConfig)
      console.log('')
      console.log('Track files from your project directory with the command: ')
      console.log('')
      console.log('    et track path/to/your/file')
      console.log('')
    })
}


module.exports = Command({
  setup: initSetup,
  command: initCommand,
  preconditions: [
    preconditions.mustHaveProject
  ]
})
