const chalk = require('chalk')

const paths = require('./paths')


module.exports = Object.freeze({
  projectConfig(projConfig) {
    console.log(`Project name:            ${projConfig.name}`)
    console.log(`Project path:            ${projConfig.projectPath}`)
    console.log(`Tracked files location:  ${paths.etProjectPath(projConfig.name)}`)
  }
})
