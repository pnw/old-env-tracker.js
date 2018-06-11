'use strict'

const R = require('ramda-extended')
const Promise = require('bluebird')

const configuration = require('../utils/configuration')
const paths = require('../utils/paths')
const display = require('../utils/display')
const Command = require('../utils/command')


class ListContext {
  /**
   *
   * @param {Object} options
   * @param {Application} options.config
   */
  constructor(options) {
    this.config = options.config
    this.verbosity = options.verbosity
  }
}

function listSetup (config) {
  return Object.freeze(new ListContext({
    config: config
  }))
}

function listCommand (ctx) {
  return Promise.resolve(ctx)
    .then(ctx => {
      console.log('')
      R.map(display.projectConfig, ctx.config.projects)
      return ctx
    })
}

module.exports = Command({
  setup: listSetup,
  command: listCommand
})
