'use strict'
const git = require('nodegit')
const fsp = require('fs-promise')
const path = require('path')
const chalk = require('chalk')

const U = require('../utils/metal')
const paths = require('../utils/paths')
const project = require('../utils/project')


class TrackContext {
  /**
   *
   * @param {Application} appConfig
   * @param {Project} project
   */
  constructor (appConfig, project) {
    this.appConfig = appConfig
    this.project = project

    // this.projectConfig = options.projectConfig
    // this.relPath = path.relative(this.projectConfig.projectPath, this.projectFilePath)
    // this.projectFilePath = paths.ensureAbsolute(options.projectFilePath)
    // this.etFilePath = paths.relToAbsEtPath(this.projectConfig, this.relPath)
  }
}


/**
 *
 * @param {TrackContext} ctx
 * @return {Promise.<>}
 */
function validateFileIsInProject(ctx) {
  if (paths.isInPath(ctx.projectConfig.projectPath, ctx.projectFilePath)) {
    return ctx
  } else {
    // TODO: handle this error gracefully
    return Promise.reject(new Error('The file must be in the current project'))
  }
}


function trackSetup (appConfig, filePath) {
  return Promise.resolve()
    .then(() => {
      Object.freeze(new TrackContext({
        config: appConfig,
        projectFilePath: filePath,
        projectConfig: projectConfig
      }))
    })
    .then(ctx => validateFileIsInProject(ctx))
}


/**
 * Move the file out of the project into the et project directory
 * @param {TrackContext} ctx
 * @return {Promise.<TrackContext>}
 */
function moveFile(ctx) {
  // TODO: what happens if the file exists already?
  // Option to clobber: https://www.npmjs.com/package/fs-extra#movesrc-dest-options-callback
  return fsp.move(ctx.projectFilePath, ctx.etFilePath)
    .then(R.always(ctx))
}

/**
 * Create a symlink from the et project file back to the original location
 * @param {TrackContext} ctx
 * @return {Promise.<TrackContext>}
 */
function createSymlink(ctx) {
  return fsp.createSymlink(ctx.etFilePath, ctx.projectFilePath)
    .then(R.always(ctx))
}

function commitFile(ctx) {
  return git
}

function trackCommand (ctx) {
  console.log(ctx)
  // TODO: validate that the parent file isn't already being tracked
  return Promise.resolve(ctx)
    .then(moveFile)
    .then(createSymlink)
    .then(commitFile)


}

module.exports = Object.freeze({
  Context: TrackContext,
  setup: trackSetup,
  command: trackCommand,
})

