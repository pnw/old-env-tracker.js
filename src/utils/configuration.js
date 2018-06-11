'use strict'

const R = require('ramda-extended')
const fsp = require('fs-promise')
const Promise = require('bluebird')
const path = require('path')
const homedir = require('homedir')

const paths = require('./paths')

class Project {
  /**
   *
   * @param {Object} options
   * @param {String} options.projectPath
   * @param {String} options.etPath
   * @param {Number} [idx] position of the project in the resolutions file. undefined if new project.
   * @constructor
   */
  constructor (options, idx) {
    if (!options) options = {}
    this.idx = idx

    this.etPath = options.etPath
    this.projectPath = options.projectPath
  }

  serialize () {
    return {
      etPath: this.etPath,
      projectPath: this.projectPath,
    }
  }

  isInEtPath (path) {
    return paths.isAncestor(this.etPath, path)
  }
  isInProjectPath (path) {
    return paths.isAncestor(this.projectPath, path)
  }

}


/**
 * Programmatic interface to the configuration file
 */
class Settings {

  /**
   *
   * @param {Object} options
   * @param {String} options.pathToResolutions
   */
  constructor (options) {
    this._options = options
    this.etPath = options.etRoot || path.join(homedir(), '.et')

    this.pathToResolutions = options.pathToResolutions || path.join(this.etPath, '.resolutions')
    if (!this.pathToResolutions) throw new Error('Must define the location of the config file')
  }

  /**
   * @returns {Project[]}
   */
  get projects () {
    // TODO: What if the projects file is not an array?
    return safeReadJSONSync(this.pathToResolutions, []).map((p, i) => new Project(p, i))
  }

}

/**
 *
 * @param {String} path
 * @param {*} defaultValue Value to be returned if the file is empty or doesn't exist
 * @returns {*}
 */
function safeReadJSONSync (path, defaultValue) {
  try {
    return fsp.readJSONSync(path) || defaultValue
  } catch (e) {
    if (e.code === 'ENOENT' && typeof defaultValue !== 'undefined') {
      return defaultValue
    } else {
      throw e
    }
  }
}

/**
 * Writes a JSON value to a file. Will create the file (and full path to file) if it does
 * not exist
 * @param {String} path
 * @param {Object} data
 * @returns {Promise.<*>}
 */

function safeWriteJSON (path, data) {
  // TODO: handle ENOENT if path doesn't exist
  return fsp.writeJSON(path, data)
}


class Application {
  /**
   * @param {Object} options
   * @param {String} [options.cwd] aka "Current Working Directory" e.g. process.cwd()
   * @param {String} [options.pathToResolutions]
   */
  constructor (options) {
    if (!options) options = {}
    this.cwd = options.cwd || process.cwd()
    this.settings = new Settings({
      pathToResolutions: options.pathToResolutions || paths.etResolutions()
    })
  }

  /**
   * @returns {boolean}
   */
  get inEtContext () {
    return this.currentProject.isInEtPath(this.cwd)
  }

  /**
   * @returns {boolean}
   */
  get inProjectContext () {
    return this.currentProject.isInProjectPath(this.cwd)
  }

  /**
   * @returns {Project}
   */
  get currentProject () {
    return this.settings.projects.find(p => p.isInEtPath(this.cwd) || p.isInProjectPath(this.cwd)) || null
  }

  /**
   *
   * @param {Project} project
   */
  saveProject(project) {
    var projects = this.settings.projects
    const newProjects = R.isNil(project.idx) ? R.append(project, projects) : R.update(project.idx, project, projects)
    return safeWriteJSON(this.pathToResolutions, newProjects.map(p => p.serialize()))
  }

}

module.exports = {
  AppContext: Application,
  Project: Project,
  Settings: Settings
}
