const R = require('ramda-extended')
const fsp = require('fs-promise')
const path = require('path')
const homedir = require('homedir')

/**
 * @return {String}
 */
function etRoot() {
  // TODO: Move this to a configuration file
  return path.join(homedir(), '.et')
}

/**
 * @return {String}
 */
function etConfig() {
  // TODO: This should be configurable from ENV Var?
  return path.join(etRoot(), '.etconfig')
}

function etResolutions () {
  return path.join(etRoot(), '.etResolutions')
}

/**
 * @param {String} name
 * @return {String}
 */
function etProjectPath (name) {
  return path.join(etRoot(), name)
}

/**
 * Takes a relative path and returns the absolute path of the file in the source project
 * @param {Project} projectConfig
 * @param {String} relpath
 */
function relToAbsEtPath(projectConfig, relpath) {
  return path.join(projectConfig.projectPath, relpath)
}

/**
 * Takes a relative path and returns the absolute path of the file in the et project
 * @param {Project} projectConfig
 * @param {String} relpath
 */
function relToAbsProjectPath(projectConfig, relpath) {
  return path.join(projectConfig.etPath, relpath)
}

/**
 * This returns the absolute filepath if the provided filePath is relative.
 * If filePath is relative, we assume it's relative to the users current shell working directory
 * @param {String} filePath
 * @returns {string}
 */
function ensureAbsolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
}

/**
 * Note: In this function, a path is considered an ancestor of itself
 *
 * @param {String} ancestor
 * @param {String} descendant
 * @returns {Boolean}
 */
function isAncestor(ancestor, descendant) {
  // We know a path is relative if the relative path contains only '.', '..', and `path.sep`
  return R.pipe(
    R.replace(new RegExp(path.sep, 'g'), ''),
    R.replace(/\./g, ''),
    R.isEmpty
  )(path.relative(descendant, ancestor))
}


module.exports = {
  ensureAbsolute: ensureAbsolute,
  etConfig: etConfig,
  etProjectPath: etProjectPath,
  etResolutions: etResolutions,
  etRoot: etRoot,
  isAncestor: isAncestor,
  relToAbsEtPath: relToAbsEtPath,
  relToAbsProjectPath: relToAbsProjectPath,
}
