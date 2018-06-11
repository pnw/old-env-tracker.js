#!/usr/bin/env node

require('any-promise/register')('bluebird')
const program = require('commander')
const pkg = require('../package.json')
const R = require('ramda-extended')
const decorators = require('./utils/decorators')

function lazyCommand (name) {
  const commandPath = `./commands/${name}`
  function actor () {
    return require(commandPath).apply(arguments)
  }
  return actor
}


program
  .version(pkg.version)


// TODO: make this a precondition - auto-install if not installed yet
program
  .command('install')
  .action(lazyCommand('install'))
  .description('Initialize env-tracker on your system')

/*
  Project commands
 */
program
  .command('init')
  .option('-n, --name [name]', 'Name of the tracking project')
  .description('Register a new project')
  .action(lazyCommand('init'))

program
  .command('rmproject')
  .description('Un-registers a project')

program
  .command('list')
  .description('List registered projects')
  .action(lazyCommand('list'))

program
  .command('rename')
  .description('Renames a registered project')

program
  .command('restore')
  .description('Restore links from your registered files into your project')

program
  .command('switch')
  .description('If you\'re in a project path, cd to the corresponding et path, and vice versa')

/*
  File commands
 */

/*
  Git commands
 */
program
  .command('commit')
  .description('Commits all changes to all registered files for the current project')

program
  .command('status')
  .description('Tells you if there are any unsaved changes to your tracked files')

program
  .command('compare')
  .description('Shows untracked files in the current project, and shows files that have been tracked by et')

/*
  File manipulation
 */
program
  .command('track <file-path>')
  .description('Register a file to be tracked in the current project')
  .action(lazyCommand('track'))

program
  .command('untrack')
  .description('Un-register a tracked file')


if (R.length(process.argv) === 2) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
